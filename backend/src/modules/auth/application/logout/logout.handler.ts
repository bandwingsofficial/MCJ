import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { LogoutCommand } from './logout.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { DeviceType } from '../../domain/enums/device-type.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

// =====================
// DEVICE PARSER
// =====================

const parseDeviceType = (
  ua?: string | null,
): DeviceType => {
  if (!ua) {
    return DeviceType.UNKNOWN;
  }

  const lower = ua.toLowerCase();

  if (lower.includes('mobile')) {
    return DeviceType.MOBILE;
  }

  if (lower.includes('tablet')) {
    return DeviceType.TABLET;
  }

  return DeviceType.DESKTOP;
};

export class LogoutHandler {
  private readonly logger = new Logger(
    LogoutHandler.name,
  );

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(
    command: LogoutCommand,
  ): Promise<void> {
    // =====================
    // FETCH SESSION
    // =====================

    const session =
      await this.sessionRepo.findById(
        command.sessionId,
      );

    // ====================================
    // IDEMPOTENT LOGOUT (IMPORTANT)
    // ====================================

    if (!session) {
      this.logger.warn(
        `⚠️ Session already removed: ${command.sessionId}`,
      );

      return;
    }

    // =====================
    // OWNERSHIP CHECK
    // =====================

    if (
      !session.isOwnedBy(command.userId)
    ) {
      this.logger.warn(
        `⚠️ Unauthorized logout attempt`,
      );

      return;
    }

    // =====================
    // ALREADY REVOKED
    // =====================

    if (session.isRevoked) {
      this.logger.warn(
        `⚠️ Session already revoked: ${session.id}`,
      );

      return;
    }

    // =====================
    // REVOKE SESSION
    // =====================

    session.revoke();

    await this.sessionRepo.update(
      session,
    );

    // =====================
    // AUDIT LOG
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId: session.userId,

        action: AuditAction.LOGOUT,

        sessionId: session.id,

        ipAddress: command.ipAddress,

        userAgent: command.userAgent,

        deviceType: parseDeviceType(
          command.userAgent,
        ),
      }),
    );

    // =====================
    // SUCCESS LOG
    // =====================

    this.logger.log(
      `✅ Session revoked: ${session.id}`,
    );
  }
}