// application/refresh/refresh-token.handler.ts

import { Inject, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';

import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenResult } from './refresh-token.result';

import { AUTH_TOKENS } from '../../auth.tokens';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';
import type { TokenPort } from '../ports/token.port';

import { AuditLog } from '../../domain/entities/audit-log.entity';
import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { UserDomainService } from '../../domain/services/user-domain.service';
import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

// 🔥 simple device parser (reuse your util if exists)
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;

  const lower = ua.toLowerCase();
  if (lower.includes('mobile')) return DeviceType.MOBILE;
  if (lower.includes('tablet')) return DeviceType.TABLET;

  return DeviceType.DESKTOP;
};

export class RefreshTokenHandler {
  private readonly logger = new Logger(RefreshTokenHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    try {
      if (!command.refreshToken) {
        throw new ValidationError(
          'Refresh token is required',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      // =====================
      // 1️⃣ VERIFY JWT
      // =====================
      let payload;
      try {
        payload = await this.tokenPort.verifyRefreshToken(
          command.refreshToken,
        );
      } catch {
        throw new ValidationError(
          'Invalid refresh token',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      const { sub: userId, sessionId } = payload || {};

      if (!userId || !sessionId) {
        throw new ValidationError(
          'Invalid refresh token',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      // =====================
      // 2️⃣ FIND SESSION
      // =====================
      const session = await this.sessionRepo.findById(sessionId);

      if (!session) {
        throw new ValidationError(
          'Session not found',
          ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      // =====================
      // 3️⃣ VALIDATE SESSION
      // =====================
      this.userDomainService.ensureSessionIsValid(session);

      // =====================
      // 4️⃣ HASH INCOMING TOKEN
      // =====================
      const incomingHash = crypto
        .createHash('sha256')
        .update(command.refreshToken)
        .digest('hex');

      // =====================
      // 🚨 5️⃣ REUSE DETECTION
      // =====================
      if (incomingHash !== session.refreshTokenHash) {
        this.logger.error(
          `🚨 TOKEN REUSE DETECTED for session: ${session.id}`,
        );

        await this.sessionRepo.revokeAllByUserId(userId);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),
            userId,
            action: AuditAction.SESSION_REVOKED,
            sessionId: session.id,
            ipAddress: command.ipAddress,
            userAgent: command.userAgent,
            deviceType: parseDeviceType(command.userAgent),
            metadata: { reason: 'TOKEN_REUSE_DETECTED' },
          }),
        );

        throw new ValidationError(
          'Refresh token reuse detected. All sessions revoked.',
          ERROR_CODES.TOKEN_REUSE_DETECTED,
        );
      }

      // =====================
      // 6️⃣ GET USER (needed for payload)
      // =====================
      const user = await this.userRepo.findById(userId);

      if (!user) {
        throw new ValidationError(
          'User not found',
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      // =====================
      // 🔁 7️⃣ GENERATE TOKENS (FIXED)
      // =====================
      const tokens = await this.tokenPort.generateTokenPair({
        userId,
        sessionId: session.id,
        email: user.email.getValue(), // 🔥 FIXED
        role: user.role,              // 🔥 FIXED
      });

      // =====================
      // 8️⃣ HASH NEW TOKEN
      // =====================
      const newHash = crypto
        .createHash('sha256')
        .update(tokens.refreshToken)
        .digest('hex');

      // =====================
      // 🔄 9️⃣ ROTATE SESSION
      // =====================
      session.rotate(newHash, tokens.refreshTokenExpiresAt);

      await this.sessionRepo.update(session);

      // =====================
      // 🔥 1️⃣0️⃣ AUDIT SUCCESS
      // =====================
      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),
          userId,
          action: AuditAction.REFRESH,
          sessionId: session.id,
          ipAddress: command.ipAddress,
          userAgent: command.userAgent,
          deviceType: parseDeviceType(command.userAgent),
        }),
      );

      this.logger.log(`🔄 Token refreshed: ${session.id}`);

      // =====================
      // 1️⃣1️⃣ RESPONSE
      // =====================
      return new RefreshTokenResult(
        tokens.accessToken,
        tokens.refreshToken,
        tokens.accessTokenExpiresAt,
        tokens.refreshTokenExpiresAt,
      );
    } catch (error) {
      if (error instanceof DomainError) {
        throw new ValidationError(error.message, error.code);
      }

      throw error;
    }
  }
}