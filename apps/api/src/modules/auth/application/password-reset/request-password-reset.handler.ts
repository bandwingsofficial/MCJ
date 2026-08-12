// application/password-reset/request-password-reset.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID, randomInt } from 'crypto';

import { RequestPasswordResetCommand } from './request-password-reset.command';

import { RequestPasswordResetResult } from './request-password-reset.result';

import type { UserRepository } from '../../domain/repositories/user.repository';

import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import type { PasswordHasherPort } from '../ports/password-hasher.port';

import { Email } from '../../domain/value-objects/email.vo';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

import { ValidationError } from '../errors/validation.error';
import { RateLimitError } from '../errors/rate-limit.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import {
  parseDeviceType,
  normalizeIpAddress,
  buildFingerprint,
} from '../utils/device.util';

import { DomainError } from '../../domain/errors/domain.error';
import { mapDomainError } from '../utils/map-domain-error.util';

// =====================
// 🔥 CONFIG
// =====================

const OTP_EXPIRY_MINUTES = 10;

const REQUEST_COOLDOWN_MS = 60 * 1000;

const MAX_REQUESTS_PER_HOUR = 5;

const GENERIC_RESET_MESSAGE =
  'If an account exists for this email, a reset code has been sent';

export class RequestPasswordResetHandler {
  private readonly logger = new Logger(RequestPasswordResetHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.PASSWORD_RESET_REPOSITORY)
    private readonly resetRepo: PasswordResetRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    try {
    // =====================
    // 1️⃣ VALIDATION
    // =====================

    if (!command.email?.trim()) {
      throw new ValidationError(
        'Email is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    const normalizedEmail = command.email.trim().toLowerCase();

    const emailVO = Email.create(normalizedEmail);

    // =====================
    // 🧠 DEVICE CONTEXT
    // =====================

    const ipAddress = normalizeIpAddress(command.ipAddress);

    const deviceType = parseDeviceType(command.userAgent);

    const fingerprint = buildFingerprint({
      ipAddress,
      userAgent: command.userAgent,
    });

    // =====================
    // 2️⃣ FIND USER
    // =====================

    const user = await this.userRepo.findByEmail(emailVO);

    // 🔐 prevent email enumeration — always same response
    if (!user) {
      this.logger.warn(`⚠️ Reset requested for unknown email`);

      return new RequestPasswordResetResult(GENERIC_RESET_MESSAGE);
    }

    // =====================
    // 🚫 LOGIN ELIGIBILITY
    // =====================

    try {
      user.canLogin();
    } catch {
      // Do not reveal account status differences
      return new RequestPasswordResetResult(GENERIC_RESET_MESSAGE);
    }

    // =====================
    // 🧹 CLEANUP
    // =====================

    await this.resetRepo.deleteExpiredByUserId(user.id);

    // =====================
    // ⏱️ COOLDOWN CHECK
    // =====================

    const latestToken = await this.resetRepo.findLatestActiveByUserId(user.id);

    if (latestToken) {
      const elapsed = Date.now() - latestToken.createdAt.getTime();

      const remaining = REQUEST_COOLDOWN_MS - elapsed;

      if (remaining > 0) {
        const retryAfter = Math.ceil(remaining / 1000);

        throw new RateLimitError(
          `Please wait ${retryAfter} seconds before requesting another OTP`,
          ERROR_CODES.TOO_MANY_REQUESTS,
          {
            retryAfter,

            retryAt: new Date(Date.now() + remaining),
          },
        );
      }
    }

    // =====================
    // 🚨 RATE LIMIT
    // =====================

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const requestCount = await this.resetRepo.countRecentRequests(
      user.id,
      oneHourAgo,
    );

    if (requestCount >= MAX_REQUESTS_PER_HOUR) {
      throw new RateLimitError(
        'Too many password reset requests',
        ERROR_CODES.TOO_MANY_REQUESTS,
      );
    }

    // =====================
    // 🔐 GENERATE OTP (CSPRNG)
    // =====================

    const otp = randomInt(100000, 1000000).toString();

    // =====================
    // 🔒 HASH OTP
    // =====================

    const otpHash = await this.passwordHasher.hash(otp);

    // =====================
    // 🧱 CREATE TOKEN
    // =====================

    const token = PasswordResetToken.create({
      id: randomUUID(),

      userId: user.id,

      otpHash,

      requestedFromIp: ipAddress ?? undefined,

      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    // =====================
    // 💾 SAVE TOKEN
    // =====================

    await this.resetRepo.save(token);

    // =====================
    // 📩 SEND OTP
    // =====================

    // Replace with email provider in production. Never log OTP outside development.
    if (process.env.NODE_ENV !== 'production') {
      this.logger.debug(`📩 OTP for ${user.email.getValue()} → ${otp}`);
    } else {
      this.logger.log(`📩 Password reset OTP generated for user ${user.id}`);
    }

    // =====================
    // 📝 AUDIT LOG
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId: user.id,

        action: AuditAction.PASSWORD_RESET_REQUESTED,

        ipAddress,

        userAgent: command.userAgent,

        deviceType,

        metadata: {
          fingerprint,
          resetRequested: true,
        },
      }),
    );

    // =====================
    // ✅ RESPONSE
    // =====================

    return new RequestPasswordResetResult(GENERIC_RESET_MESSAGE);
    } catch (error) {
      if (error instanceof DomainError) {
        mapDomainError(error);
      }

      throw error;
    }
  }
}
