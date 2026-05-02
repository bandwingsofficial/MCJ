// application/logout/logout.handler.ts

import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { LogoutCommand } from './logout.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { ERROR_CODES } from '../../domain/errors/error-codes';
import { ValidationError } from '../errors/validation.error';

import { AUTH_TOKENS } from '../../auth.tokens';

// 🔥 device parser (reuse your util if available)
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;

  const lower = ua.toLowerCase();
  if (lower.includes('mobile')) return DeviceType.MOBILE;
  if (lower.includes('tablet')) return DeviceType.TABLET;

  return DeviceType.DESKTOP;
};

export class LogoutHandler {
  private readonly logger = new Logger(LogoutHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    // =====================
    // 1️⃣ FETCH SESSION
    // =====================
    const session = await this.sessionRepo.findById(command.sessionId);

    if (!session) {
      throw new ValidationError(
        'Session not found',
        ERROR_CODES.SESSION_NOT_FOUND,
      );
    }

    // =====================
    // 2️⃣ OWNERSHIP CHECK (🔥 IMPORTANT)
    // =====================
    if (!session.isOwnedBy(command.userId)) {
      throw new ValidationError(
        'Unauthorized session access',
        ERROR_CODES.SESSION_UNAUTHORIZED,
      );
    }

    // =====================
    // 3️⃣ IDEMPOTENT
    // =====================
    if (session.isRevoked) {
      this.logger.warn(`⚠️ Session already revoked: ${session.id}`);
      return;
    }

    // =====================
    // 4️⃣ DOMAIN REVOKE
    // =====================
    session.revoke();
    await this.sessionRepo.update(session);

    // =====================
    // 🔥 5️⃣ AUDIT LOG
    // =====================
    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),
        userId: session.userId,
        action: AuditAction.LOGOUT,
        sessionId: session.id,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        deviceType: parseDeviceType(command.userAgent), // 🔥 ADDED
      }),
    );

    // =====================
    // 6️⃣ LOG
    // =====================
    this.logger.log(`✅ Session revoked: ${session.id}`);
  }
}