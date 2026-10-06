// application/password-reset/reset-password.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { ResetPasswordCommand } from './reset-password.command';

import { ResetPasswordResult } from './reset-password.result';

import type { UserRepository } from '../../domain/repositories/user.repository';

import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import type { PasswordHasherPort } from '../ports/password-hasher.port';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

import { ValidationError } from '../errors/validation.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { RateLimitError } from '../errors/rate-limit.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import {
  parseDeviceType,
  normalizeIpAddress,
  buildFingerprint,
} from '../utils/device.util';

import { mapDomainError } from '../utils/map-domain-error.util';
import { DomainError } from '../../domain/errors/domain.error';
import { parsePasswordResetToken } from './password-reset-token.util';

// =====================
// 🔥 CONFIG
// =====================

const MAX_ATTEMPTS = 5;

export class ResetPasswordHandler {
  private readonly logger = new Logger(ResetPasswordHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.PASSWORD_RESET_REPOSITORY)
    private readonly resetRepo: PasswordResetRepository,

    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: ResetPasswordCommand): Promise<ResetPasswordResult> {
    try {
    // =====================
    // 1️⃣ VALIDATION
    // =====================

    if (!command.token?.trim()) {
      throw new ValidationError(
        'Reset token is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (!command.newPassword || command.newPassword.length < 8) {
      throw new ValidationError(
        'Password must be at least 8 characters',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }

    // =====================
    // 🧠 DEVICE CONTEXT
    // =====================

    const ipAddress = normalizeIpAddress(command.ipAddress);

    const deviceType = parseDeviceType(command.userAgent);

    const fingerprint = buildFingerprint({
      ipAddress,
      userAgent: command.userAgent,
    });

    const parsed = parsePasswordResetToken(command.token);
    if (!parsed) {
      throw new UnauthorizedError(
        'Invalid or expired reset link',
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const token = await this.resetRepo.findById(parsed.id);

    if (!token) {
      throw new UnauthorizedError(
        'Invalid or expired reset link',
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    const user = await this.userRepo.findById(token.userId);

    if (!user) {
      throw new UnauthorizedError(
        'Invalid or expired reset link',
        ERROR_CODES.INVALID_TOKEN,
      );
    }

    user.canLogin();

    // =====================
    // 🚨 ATTEMPT LIMIT
    // =====================

    if (token.attempts >= MAX_ATTEMPTS) {
      throw new RateLimitError(
        'Too many OTP attempts',
        ERROR_CODES.TOO_MANY_REQUESTS,
        {
          attempts: token.attempts,

          remainingAttempts: 0,
        },
      );
    }

    // =====================
    // 🔐 TOKEN VALIDATION
    // =====================

    token.canBeUsed();

    const isTokenValid = await this.passwordHasher.compare(
      parsed.secret,
      token.otpHash,
    );

    if (!isTokenValid) {
      token.incrementAttempts();

      await this.resetRepo.update(token);

      const remaining = Math.max(0, MAX_ATTEMPTS - token.attempts);

      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),

          userId: user.id,

          action: AuditAction.PASSWORD_RESET_FAILED,

          ipAddress,

          userAgent: command.userAgent,

          deviceType,

          metadata: {
            fingerprint,
            attempts: token.attempts,
          },
        }),
      );

      throw new UnauthorizedError(
        'Invalid or expired reset link',
        ERROR_CODES.INVALID_TOKEN,
        {
          attempts: token.attempts,
          remainingAttempts: remaining,
        },
      );
    }

    // =====================
    // 🚫 PASSWORD REUSE
    // =====================

    const isSamePassword = await this.passwordHasher.compare(
      command.newPassword,
      user.passwordHash,
    );

    if (isSamePassword) {
      throw new ValidationError(
        'New password must be different',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }

    // =====================
    // 🔐 HASH NEW PASSWORD
    // =====================

    const newPasswordHash = await this.passwordHasher.hash(command.newPassword);

    // =====================
    // 💾 UPDATE PASSWORD
    // =====================

    await this.userRepo.updatePassword(user.id, newPasswordHash);

    // =====================
    // ✅ MARK TOKEN USED
    // =====================

    token.markUsed();

    await this.resetRepo.update(token);

    // =====================
    // 🔥 REVOKE SESSIONS
    // Session revocation is the source of truth for credential invalidation.
    // User.tokenVersion is unused and intentionally not consulted.
    // =====================

    await this.sessionRepo.revokeAllByUserId(user.id);

    // =====================
    // 📝 AUDIT SUCCESS
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId: user.id,

        action: AuditAction.PASSWORD_RESET_SUCCESS,

        ipAddress,

        userAgent: command.userAgent,

        deviceType,

        metadata: {
          fingerprint,
          revokedSessions: true,
        },
      }),
    );

    this.logger.log(`🔐 Password reset successful: ${user.id}`);

    // =====================
    // ✅ RESPONSE
    // =====================

    return new ResetPasswordResult('Password reset successful');
    } catch (error) {
      if (error instanceof DomainError) {
        mapDomainError(error);
      }

      throw error;
    }
  }
}
