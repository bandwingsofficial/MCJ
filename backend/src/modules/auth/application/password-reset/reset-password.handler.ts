// application/password-reset/reset-password.handler.ts

import { Inject, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';

import { ResetPasswordCommand } from './reset-password.command';
import { ResetPasswordResult } from './reset-password.result';

import type { UserRepository } from '../../domain/repositories/user.repository';
import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { Email } from '../../domain/value-objects/email.vo';
import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { AUTH_TOKENS } from '../../auth.tokens';
import { ValidationError } from '../errors/validation.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

// 🔥 CONFIG
const MAX_ATTEMPTS = 5;

// 🔥 device parser
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;
  const l = ua.toLowerCase();
  if (l.includes('mobile')) return DeviceType.MOBILE;
  if (l.includes('tablet')) return DeviceType.TABLET;
  return DeviceType.DESKTOP;
};

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
  ) {}

  async execute(
    command: ResetPasswordCommand,
  ): Promise<ResetPasswordResult> {
    // =====================
    // 1️⃣ VALIDATION
    // =====================
    if (!command.email?.trim()) {
      throw new ValidationError('Email is required', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!command.otp?.trim()) {
      throw new ValidationError('OTP is required', ERROR_CODES.VALIDATION_ERROR);
    }

    if (!command.newPassword || command.newPassword.length < 6) {
      throw new ValidationError(
        'Password must be at least 6 characters',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }

    const emailVO = Email.create(command.email);

    // =====================
    // 2️⃣ FIND USER
    // =====================
    const user = await this.userRepo.findByEmail(emailVO);

    if (!user) {
      throw new ValidationError('Invalid email id', ERROR_CODES.USER_NOT_FOUND);
    }

    // =====================
    // 3️⃣ GET TOKEN
    // =====================
    const token = await this.resetRepo.findLatestByUserId(user.id);

    if (!token) {
      throw new ValidationError('OTP not found', ERROR_CODES.INVALID_TOKEN);
    }

    // =====================
    // 🔥 4️⃣ BLOCK IF MAX ATTEMPTS
    // =====================
    if (token.attempts >= MAX_ATTEMPTS) {
      throw new ValidationError(
        'Too many OTP attempts',
        ERROR_CODES.TOO_MANY_REQUESTS,
        {
          attempts: token.attempts,
          remainingAttempts: 0,
        },
      );
    }

    // =====================
    // 🔐 5️⃣ DOMAIN CHECK
    // =====================
    token.canBeUsed();

    // =====================
    // 6️⃣ VERIFY OTP
    // =====================
    const incomingHash = crypto
      .createHash('sha256')
      .update(command.otp)
      .digest('hex');

    if (incomingHash !== token.otpHash) {
      // 🔥 increment attempts
      token.incrementAttempts();
      await this.resetRepo.update(token);

      const remaining = Math.max(0, MAX_ATTEMPTS - token.attempts);

      // 🔥 audit failure
      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),
          userId: user.id,
          action: AuditAction.PASSWORD_RESET_FAILED,
          ipAddress: command.ipAddress,
          userAgent: command.userAgent,
          deviceType: parseDeviceType(command.userAgent),
        }),
      );

      throw new ValidationError(
        'Invalid OTP',
        ERROR_CODES.INVALID_TOKEN,
        {
          attempts: token.attempts,
          remainingAttempts: remaining,
        },
      );
    }

    // =====================
    // 🔐 7️⃣ UPDATE PASSWORD
    // =====================
    const newHash = await bcrypt.hash(command.newPassword, 10);
    await this.userRepo.updatePassword(user.id, newHash);

    // =====================
    // 🔁 8️⃣ RESET TOKEN STATE
    // =====================
    token.markUsed();
    token.attempts = 0; // 🔥 reset attempts
    await this.resetRepo.update(token);

    // =====================
    // 🔥 9️⃣ REVOKE ALL SESSIONS
    // =====================
    await this.sessionRepo.revokeAllByUserId(user.id);

    // =====================
    // 🔥 🔟 AUDIT SUCCESS
    // =====================
    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),
        userId: user.id,
        action: AuditAction.PASSWORD_RESET_SUCCESS,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        deviceType: parseDeviceType(command.userAgent),
      }),
    );

    this.logger.log(`🔐 Password reset successful: ${user.id}`);

    // =====================
    // 1️⃣1️⃣ RESPONSE
    // =====================
    return new ResetPasswordResult('Password reset successful');
  }
}