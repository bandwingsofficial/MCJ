import { Inject, Injectable, Logger } from '@nestjs/common';
import { AccountStatus, PasswordResetChannel } from '@prisma/client';
import { randomBytes, randomInt, randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { AUTH_TOKENS } from '../../auth.tokens';
import { Email } from '../../domain/value-objects/email.vo';
import { ERROR_CODES } from '../../domain/errors/error-codes';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { AuthRateLimiterPort } from '../ports/auth-rate-limiter.port';
import type { TransactionalEmailPort } from '../ports/transactional-email.port';
import { RateLimitError } from '../errors/rate-limit.error';
import { ValidationError } from '../errors/validation.error';
import { parsePasswordResetToken } from './password-reset-token.util';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESET_AUTHORIZATION_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 8;
const MAX_VERIFY_ATTEMPTS = 5;
const DELETED_ACCOUNT_MESSAGE =
  'This account was deleted and cannot be registered again with the same email.';

type EligibleUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};

@Injectable()
export class PasswordResetOtpService {
  private readonly logger = new Logger(PasswordResetOtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(AUTH_TOKENS.AUTH_RATE_LIMITER)
    private readonly rateLimiter: AuthRateLimiterPort,
    @Inject(AUTH_TOKENS.TRANSACTIONAL_EMAIL)
    private readonly email: TransactionalEmailPort,
  ) {}

  async sendOtp(input: { email: string; ipAddress?: string }): Promise<void> {
    const normalizedEmail = this.normalizeEmail(input.email);
    Email.create(normalizedEmail);

    this.rateLimiter.consume({
      key: `pwd-reset-otp:ip:${input.ipAddress ?? 'unknown'}`,
      maxAttempts: 12,
      windowMs: 60 * 60 * 1000,
    });
    this.rateLimiter.consume({
      key: `pwd-reset-otp:email:${normalizedEmail}`,
      maxAttempts: MAX_SENDS_PER_HOUR,
      windowMs: 60 * 60 * 1000,
    });

    const user = await this.assertEligible(normalizedEmail);

    const latest = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        channel: PasswordResetChannel.OTP,
        authorizedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      const remaining = RESEND_COOLDOWN_MS - (Date.now() - latest.createdAt.getTime());
      if (remaining > 0) {
        throw new RateLimitError(
          'Please wait before requesting another OTP',
          ERROR_CODES.TOO_MANY_REQUESTS,
          { retryAfter: Math.ceil(remaining / 1000) },
        );
      }
    }

    const sentLastHour = await this.prisma.passwordResetToken.count({
      where: {
        userId: user.id,
        channel: PasswordResetChannel.OTP,
        authorizedAt: null,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });

    if (sentLastHour >= MAX_SENDS_PER_HOUR) {
      throw new RateLimitError(
        'Too many password reset requests',
        ERROR_CODES.TOO_MANY_REQUESTS,
      );
    }

    await this.prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        channel: PasswordResetChannel.OTP,
        isUsed: false,
      },
      data: { isUsed: true },
    });

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await this.passwordHasher.hash(otp);
    const now = new Date();
    const created = await this.prisma.passwordResetToken.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        otpHash,
        channel: PasswordResetChannel.OTP,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        requestedFromIp: input.ipAddress ?? null,
      },
    });

    try {
      await this.email.sendPasswordResetOtp({
        toEmail: user.email,
        recipientName: user.name,
        otp,
      });
    } catch {
      await this.prisma.passwordResetToken.delete({ where: { id: created.id } });
      throw new ValidationError(
        'Unable to send verification email. Please try again later.',
        ERROR_CODES.EMAIL_DELIVERY_FAILED,
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Password reset OTP generated for user ${user.id}`);
    }
  }

  async verifyOtp(input: {
    email: string;
    otp: string;
    ipAddress?: string;
  }): Promise<{ resetToken: string }> {
    const normalizedEmail = this.normalizeEmail(input.email);
    Email.create(normalizedEmail);
    const otp = input.otp.trim();

    if (!/^\d{6}$/.test(otp)) {
      throw new ValidationError('Invalid OTP', ERROR_CODES.VALIDATION_ERROR);
    }

    this.rateLimiter.consume({
      key: `pwd-reset-verify:email:${normalizedEmail}`,
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000,
    });

    const user = await this.assertEligible(normalizedEmail);

    const pending = await this.prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        channel: PasswordResetChannel.OTP,
        isUsed: false,
        authorizedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!pending) {
      const latestOtp = await this.prisma.passwordResetToken.findFirst({
        where: {
          userId: user.id,
          channel: PasswordResetChannel.OTP,
          authorizedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (latestOtp?.isUsed) {
        throw new ValidationError('OTP already used', ERROR_CODES.VALIDATION_ERROR);
      }

      throw new ValidationError(
        'Verification code expired. Request a new OTP.',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (pending.expiresAt.getTime() <= Date.now()) {
      await this.prisma.passwordResetToken.update({
        where: { id: pending.id },
        data: { isUsed: true },
      });
      throw new ValidationError(
        'Verification code expired. Request a new OTP.',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (pending.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new RateLimitError(
        'Too many verification attempts',
        ERROR_CODES.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await this.passwordHasher.compare(otp, pending.otpHash);
    if (!isValid) {
      await this.prisma.passwordResetToken.update({
        where: { id: pending.id },
        data: {
          attempts: { increment: 1 },
          lastAttemptAt: new Date(),
        },
      });
      throw new ValidationError('Invalid OTP', ERROR_CODES.VALIDATION_ERROR);
    }

    await this.prisma.passwordResetToken.update({
      where: { id: pending.id },
      data: { isUsed: true },
    });

    const secret = randomBytes(32).toString('base64url');
    const authorizationId = randomUUID();
    const secretHash = await this.passwordHasher.hash(secret);
    const authorizedAt = new Date();

    await this.prisma.passwordResetToken.create({
      data: {
        id: authorizationId,
        userId: user.id,
        otpHash: secretHash,
        channel: PasswordResetChannel.OTP,
        authorizedAt,
        expiresAt: new Date(authorizedAt.getTime() + RESET_AUTHORIZATION_MS),
        requestedFromIp: input.ipAddress ?? null,
      },
    });

    return { resetToken: `${authorizationId}.${secret}` };
  }

  async completeReset(input: {
    resetToken: string;
    newPassword: string;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    if (!input.newPassword || input.newPassword.length < 6) {
      throw new ValidationError(
        'Password must be at least 6 characters',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }

    const parsed = parsePasswordResetToken(input.resetToken);
    if (!parsed) {
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    const authorization = await this.prisma.passwordResetToken.findUnique({
      where: { id: parsed.id },
    });

    if (
      !authorization ||
      authorization.channel !== PasswordResetChannel.OTP ||
      !authorization.authorizedAt
    ) {
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (authorization.isUsed) {
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (authorization.expiresAt.getTime() <= Date.now()) {
      await this.prisma.passwordResetToken.update({
        where: { id: authorization.id },
        data: { isUsed: true },
      });
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    const isTokenValid = await this.passwordHasher.compare(
      parsed.secret,
      authorization.otpHash,
    );
    if (!isTokenValid) {
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    const record = await this.prisma.user.findUnique({
      where: { id: authorization.userId },
    });
    if (!record) {
      throw new ValidationError(
        'Reset authorization expired',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    await this.assertEligible(record.email);

    const isSamePassword = await this.passwordHasher.compare(
      input.newPassword,
      record.passwordHash,
    );
    if (isSamePassword) {
      throw new ValidationError(
        'New password must be different',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }

    const passwordHash = await this.passwordHasher.hash(input.newPassword);
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: record.id },
        data: {
          passwordHash,
          lastPasswordChangeAt: now,
        },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: authorization.id },
        data: { isUsed: true },
      }),
      this.prisma.session.updateMany({
        where: { userId: record.id, isRevoked: false },
        data: { isRevoked: true, revokedAt: now },
      }),
      this.prisma.auditLog.create({
        data: {
          id: randomUUID(),
          userId: record.id,
          action: 'PASSWORD_RESET_SUCCESS',
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
          metadata: { channel: 'OTP', revokedSessions: true },
        },
      }),
    ]);

    this.logger.log(`Password reset completed for user ${record.id}`);
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async assertEligible(email: string): Promise<EligibleUser> {
    const deletion = await this.prisma.userDeletionRecord.findUnique({
      where: { originalEmailNormalized: email },
      select: { id: true },
    });

    if (deletion) {
      throw new ValidationError(DELETED_ACCOUNT_MESSAGE, ERROR_CODES.ACCOUNT_INACTIVE);
    }

    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        status: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      if (user?.deletedAt) {
        throw new ValidationError(DELETED_ACCOUNT_MESSAGE, ERROR_CODES.ACCOUNT_INACTIVE);
      }

      throw new ValidationError(
        'No account was found for this email.',
        ERROR_CODES.USER_NOT_FOUND,
      );
    }

    if (user.status === AccountStatus.BLOCKED) {
      throw new ValidationError(
        'Your account has been suspended. Please contact support.',
        ERROR_CODES.ACCOUNT_BLOCKED,
      );
    }

    if (user.status === AccountStatus.INACTIVE) {
      throw new ValidationError('Account is inactive', ERROR_CODES.ACCOUNT_INACTIVE);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
    };
  }
}
