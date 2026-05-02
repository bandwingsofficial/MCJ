// application/session/revoke-session.handler.ts

import { Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

import { RevokeSessionCommand } from './revoke-session.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { AUTH_TOKENS } from '../../auth.tokens';
import { ValidationError } from '../errors/validation.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

// 🔥 device parser (keep or replace with your util)
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;

  const lower = ua.toLowerCase();
  if (lower.includes('mobile')) return DeviceType.MOBILE;
  if (lower.includes('tablet')) return DeviceType.TABLET;

  return DeviceType.DESKTOP;
};

export class RevokeSessionHandler {
  private readonly logger = new Logger(RevokeSessionHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
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
    // 2️⃣ OWNERSHIP CHECK
    // =====================
    if (!session.isOwnedBy(command.userId)) {
      throw new ValidationError(
        'Unauthorized session access',
        ERROR_CODES.SESSION_UNAUTHORIZED,
      );
    }

    // =====================
    // 3️⃣ IDEMPOTENT CHECK
    // =====================
    if (session.isRevoked) {
      this.logger.warn(`⚠️ Already revoked: ${session.id}`);
      return;
    }

    // =====================
    // 4️⃣ DOMAIN ACTION
    // =====================
    session.revoke();
    await this.sessionRepo.update(session);

    // =====================
    // 🔥 5️⃣ AUDIT LOG
    // =====================
    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(), // ✅ clean & correct
        userId: session.userId,
        action: AuditAction.SESSION_REVOKED,
        sessionId: session.id,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        deviceType: parseDeviceType(command.userAgent),
      }),
    );

    this.logger.log(`✅ Session revoked: ${session.id}`);
  }
}