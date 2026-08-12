// application/session/revoke-session.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { RevokeSessionCommand } from './revoke-session.command';

import type { SessionRepository } from '../../domain/repositories/session.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

import { UnauthorizedError } from '../errors/unauthorized.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

import {
  parseDeviceType,
  normalizeIpAddress,
  buildFingerprint,
} from '../utils/device.util';

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
    // 1️⃣ VALIDATION
    // =====================

    if (!command.sessionId?.trim()) {
      throw new UnauthorizedError(
        'SessionId is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (!command.userId?.trim()) {
      throw new UnauthorizedError(
        'UserId is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    // =====================
    // 2️⃣ FETCH SESSION
    // =====================

    const session = await this.sessionRepo.findById(command.sessionId);

    if (!session) {
      throw new UnauthorizedError(
        'Session not found',
        ERROR_CODES.SESSION_NOT_FOUND,
      );
    }

    // =====================
    // 3️⃣ OWNERSHIP CHECK
    // =====================

    if (!session.isOwnedBy(command.userId)) {
      this.logger.warn(`🚨 Unauthorized revoke attempt: ${command.userId}`);

      throw new UnauthorizedError(
        'Unauthorized session access',
        ERROR_CODES.SESSION_UNAUTHORIZED,
      );
    }

    // =====================
    // 4️⃣ IDEMPOTENT
    // =====================

    if (session.isRevoked) {
      this.logger.warn(`⚠️ Session already revoked: ${session.id}`);

      return;
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
    // 🔐 REVOKE SESSION
    // =====================

    session.revoke();

    session.fingerprint = fingerprint;

    await this.sessionRepo.update(session);

    // =====================
    // 📝 AUDIT LOG
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId: session.userId,

        action: AuditAction.SESSION_REVOKED,

        sessionId: session.id,

        ipAddress,

        userAgent: command.userAgent,

        deviceType,

        metadata: {
          fingerprint,
          revoked: true,
        },
      }),
    );

    // =====================
    // ✅ LOG SUCCESS
    // =====================

    this.logger.log(`✅ Session revoked: ${session.id}`);
  }
}
