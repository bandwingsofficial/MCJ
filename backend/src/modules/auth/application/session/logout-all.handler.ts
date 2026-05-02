// application/session/logout-all.handler.ts

import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { LogoutAllCommand } from './logout-all.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { AUTH_TOKENS } from '../../auth.tokens';
import { ValidationError } from '../errors/validation.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

// 🔥 device parser (reuse your util if available)
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;

  const lower = ua.toLowerCase();
  if (lower.includes('mobile')) return DeviceType.MOBILE;
  if (lower.includes('tablet')) return DeviceType.TABLET;

  return DeviceType.DESKTOP;
};

export class LogoutAllHandler {
  private readonly logger = new Logger(LogoutAllHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(command: LogoutAllCommand): Promise<void> {
    // =====================
    // 1️⃣ VALIDATION
    // =====================
    if (!command.userId) {
      throw new ValidationError(
        'UserId is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    // =====================
    // 2️⃣ REVOKE ALL SESSIONS
    // =====================
    await this.sessionRepo.revokeAllByUserId(command.userId);

    // =====================
    // 🔥 3️⃣ AUDIT LOG
    // =====================
    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),
        userId: command.userId,
        action: AuditAction.LOGOUT_ALL,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        deviceType: parseDeviceType(command.userAgent), // 🔥 ADDED
      }),
    );

    // =====================
    // 4️⃣ LOG
    // =====================
    this.logger.log(
      `🔥 All sessions revoked for user: ${command.userId}`,
    );
  }
}