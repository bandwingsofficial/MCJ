import { Inject, Injectable, Logger } from '@nestjs/common';
import { EmailVerificationStatus, Role } from '@prisma/client';
import { randomInt, randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { UserAccountLifecycleService } from '../../../admin-user-management/application/user-account-lifecycle.service';
import { AUTH_TOKENS } from '../../auth.tokens';
import { Email } from '../../domain/value-objects/email.vo';
import { ERROR_CODES } from '../../domain/errors/error-codes';
import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { AuthRateLimiterPort } from '../ports/auth-rate-limiter.port';
import type { TransactionalEmailPort } from '../ports/transactional-email.port';
import { RateLimitError } from '../errors/rate-limit.error';
import { ValidationError } from '../errors/validation.error';

const OTP_EXPIRY_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;
const MAX_SENDS_PER_HOUR = 8;
const MAX_VERIFY_ATTEMPTS = 5;
const REGISTRATION_VERIFICATION_WINDOW_MS = 30 * 60 * 1000;

@Injectable()
export class RegistrationEmailVerificationService {
  private readonly logger = new Logger(RegistrationEmailVerificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountLifecycle: UserAccountLifecycleService,
    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
    @Inject(AUTH_TOKENS.AUTH_RATE_LIMITER)
    private readonly rateLimiter: AuthRateLimiterPort,
    @Inject(AUTH_TOKENS.TRANSACTIONAL_EMAIL)
    private readonly email: TransactionalEmailPort,
  ) {}

  async sendOtp(input: {
    email: string;
    ipAddress?: string;
  }): Promise<{ retryAfterSeconds?: number }> {
    const normalizedEmail = this.normalizeEmail(input.email);
    Email.create(normalizedEmail);

    this.rateLimiter.consume({
      key: `reg-email-otp:ip:${input.ipAddress ?? 'unknown'}`,
      maxAttempts: 12,
      windowMs: 60 * 60 * 1000,
    });

    this.rateLimiter.consume({
      key: `reg-email-otp:email:${normalizedEmail}`,
      maxAttempts: MAX_SENDS_PER_HOUR,
      windowMs: 60 * 60 * 1000,
    });

    await this.assertEmailAvailableForRegistration(normalizedEmail);

    const latest = await this.prisma.emailVerificationChallenge.findFirst({
      where: {
        email: normalizedEmail,
        status: { in: [EmailVerificationStatus.PENDING, EmailVerificationStatus.VERIFIED] },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latest) {
      const elapsed = Date.now() - latest.lastSentAt.getTime();
      const remaining = RESEND_COOLDOWN_MS - elapsed;
      if (remaining > 0) {
        throw new RateLimitError(
          'Please wait before requesting another OTP',
          ERROR_CODES.TOO_MANY_REQUESTS,
          { retryAfter: Math.ceil(remaining / 1000) },
        );
      }
    }

    await this.prisma.emailVerificationChallenge.updateMany({
      where: {
        email: normalizedEmail,
        status: { in: [EmailVerificationStatus.PENDING, EmailVerificationStatus.VERIFIED] },
      },
      data: {
        status: EmailVerificationStatus.CONSUMED,
        consumedAt: new Date(),
      },
    });

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await this.passwordHasher.hash(otp);
    const now = new Date();

    await this.prisma.emailVerificationChallenge.create({
      data: {
        id: randomUUID(),
        email: normalizedEmail,
        otpHash,
        expiresAt: new Date(now.getTime() + OTP_EXPIRY_MS),
        lastSentAt: now,
        requestedFromIp: input.ipAddress ?? null,
      },
    });

    try {
      await this.email.sendEmailVerificationOtp({
        toEmail: normalizedEmail,
        otp,
      });
    } catch {
      throw new ValidationError(
        'Unable to send verification email. Please try again later.',
        ERROR_CODES.EMAIL_DELIVERY_FAILED,
      );
    }

    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`Registration email OTP generated for ${normalizedEmail}`);
    }

    return {};
  }

  async verifyOtp(input: {
    email: string;
    otp: string;
    ipAddress?: string;
  }): Promise<{ verified: true }> {
    const normalizedEmail = this.normalizeEmail(input.email);
    Email.create(normalizedEmail);

    if (!/^\d{6}$/.test(input.otp.trim())) {
      throw new ValidationError('Invalid OTP', ERROR_CODES.VALIDATION_ERROR);
    }

    this.rateLimiter.consume({
      key: `reg-email-verify:email:${normalizedEmail}`,
      maxAttempts: 20,
      windowMs: 15 * 60 * 1000,
    });

    const challenge = await this.prisma.emailVerificationChallenge.findFirst({
      where: {
        email: normalizedEmail,
        status: EmailVerificationStatus.PENDING,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new ValidationError(
        'Verification code expired. Request a new OTP.',
        ERROR_CODES.SESSION_EXPIRED,
      );
    }

    if (challenge.expiresAt.getTime() <= Date.now()) {
      await this.prisma.emailVerificationChallenge.update({
        where: { id: challenge.id },
        data: { status: EmailVerificationStatus.CONSUMED, consumedAt: new Date() },
      });
      throw new ValidationError(
        'Verification code expired. Request a new OTP.',
        ERROR_CODES.SESSION_EXPIRED,
      );
    }

    if (challenge.attempts >= MAX_VERIFY_ATTEMPTS) {
      throw new RateLimitError(
        'Too many verification attempts',
        ERROR_CODES.TOO_MANY_REQUESTS,
      );
    }

    const isValid = await this.passwordHasher.compare(input.otp.trim(), challenge.otpHash);

    if (!isValid) {
      await this.prisma.emailVerificationChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new ValidationError('Invalid OTP', ERROR_CODES.VALIDATION_ERROR);
    }

    await this.prisma.emailVerificationChallenge.update({
      where: { id: challenge.id },
      data: {
        status: EmailVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
      },
    });

    return { verified: true };
  }

  async assertVerifiedForRegistration(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    const challenge = await this.prisma.emailVerificationChallenge.findFirst({
      where: {
        email: normalizedEmail,
        status: EmailVerificationStatus.VERIFIED,
      },
      orderBy: { verifiedAt: 'desc' },
    });

    if (!challenge?.verifiedAt) {
      throw new ValidationError(
        'Email must be verified before registration',
        ERROR_CODES.USER_EMAIL_NOT_VERIFIED,
      );
    }

    const age = Date.now() - challenge.verifiedAt.getTime();
    if (age > REGISTRATION_VERIFICATION_WINDOW_MS) {
      throw new ValidationError(
        'Email verification expired. Please verify your email again.',
        ERROR_CODES.SESSION_EXPIRED,
      );
    }
  }

  async consumeVerifiedChallenge(email: string): Promise<void> {
    const normalizedEmail = this.normalizeEmail(email);
    await this.prisma.emailVerificationChallenge.updateMany({
      where: {
        email: normalizedEmail,
        status: EmailVerificationStatus.VERIFIED,
      },
      data: {
        status: EmailVerificationStatus.CONSUMED,
        consumedAt: new Date(),
      },
    });
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private async assertEmailAvailableForRegistration(email: string): Promise<void> {
    await this.accountLifecycle.assertRegistrationAllowed(email, undefined);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
      },
      select: { id: true, role: true, lastLoginAt: true },
    });

    if (!existingUser) {
      return;
    }

    const claimable =
      existingUser.role === Role.STUDENT && existingUser.lastLoginAt === null;

    if (!claimable) {
      throw new ValidationError(
        'Email is already registered',
        ERROR_CODES.USER_ALREADY_EXISTS,
      );
    }
  }
}
