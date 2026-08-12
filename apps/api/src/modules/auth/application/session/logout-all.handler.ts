// application/session/logout-all.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { LogoutAllCommand } from './logout-all.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

import { ValidationError } from '../errors/validation.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import {
  parseDeviceType,
  normalizeIpAddress,
  buildFingerprint,
} from '../utils/device.util';

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

    if (!command.userId?.trim()) {
      throw new ValidationError(
        'UserId is required',
        ERROR_CODES.VALIDATION_ERROR,
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

    // =====================
    // 2️⃣ REVOKE ALL
    // =====================

    await this.sessionRepo.revokeAllByUserId(command.userId);

    // =====================
    // 📝 AUDIT LOG
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId: command.userId,

        action: AuditAction.LOGOUT_ALL,

        ipAddress,

        userAgent: command.userAgent,

        deviceType,

        metadata: {
          fingerprint,
          revokeAll: true,
        },
      }),
    );

    // =====================
    // ✅ LOG SUCCESS
    // =====================

    this.logger.log(`🔥 All sessions revoked for user: ${command.userId}`);
  }
}
