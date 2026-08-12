// application/refresh/refresh-token.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { RefreshTokenCommand } from './refresh-token.command';
import { RefreshTokenResult } from './refresh-token.result';

import { AUTH_TOKENS } from '../../auth.tokens';

import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import type { TokenPort, RefreshTokenPayload } from '../ports/token.port';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { UnauthorizedError } from '../errors/unauthorized.error';

import { hashToken } from '../utils/token.util';
import { mapDomainError } from '../utils/map-domain-error.util';

import { parseDeviceType, buildFingerprint } from '../utils/device.util';

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
  ) {}

  async execute(command: RefreshTokenCommand): Promise<RefreshTokenResult> {
    try {
      if (!command.refreshToken) {
        throw new UnauthorizedError(
          'Refresh token is required',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      let payload: RefreshTokenPayload;

      try {
        payload = await this.tokenPort.verifyRefreshToken(command.refreshToken);
      } catch {
        throw new UnauthorizedError(
          'Invalid refresh token',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      const { sub: userId, sessionId } = payload;

      const session = await this.sessionRepo.findById(sessionId);

      if (!session) {
        throw new UnauthorizedError(
          'Session not found',
          ERROR_CODES.SESSION_NOT_FOUND,
        );
      }

      if (!session.isOwnedBy(userId)) {
        this.logger.error(`🚨 Session ownership mismatch: ${sessionId}`);

        await this.sessionRepo.revokeAllByUserId(userId);

        throw new UnauthorizedError(
          'Session unauthorized',
          ERROR_CODES.SESSION_UNAUTHORIZED,
        );
      }

      session.canBeUsed();

      const incomingHash = hashToken(command.refreshToken);

      if (incomingHash !== session.refreshTokenHash) {
        await this.handleReuseDetection(userId, session.id, command);
      }

      const user = await this.userRepo.findById(userId);

      if (!user) {
        throw new UnauthorizedError(
          'User not found',
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      user.canLogin();

      if (user.isAdmin() && !user.mfaEnabled) {
        throw new UnauthorizedError(
          'Admin MFA required',
          ERROR_CODES.ADMIN_MFA_REQUIRED,
        );
      }

      const tokens = await this.tokenPort.generateTokenPair({
        userId: user.id,
        sessionId: session.id,
        email: user.email.getValue(),
        role: user.role,
      });

      const newHash = hashToken(tokens.refreshToken);
      const fingerprint = buildFingerprint({
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
      });

      const rotated = await this.sessionRepo.rotateIfHashMatches({
        sessionId: session.id,
        expectedHash: incomingHash,
        newHash,
        expiresAt: tokens.refreshTokenExpiresAt,
        fingerprint,
      });

      if (!rotated) {
        // Another request may have rotated concurrently with the same token.
        // Do not treat that as stolen-token reuse (which revokes all devices).
        const latest = await this.sessionRepo.findById(session.id);

        if (
          !latest ||
          !latest.isActive() ||
          latest.refreshTokenHash === incomingHash
        ) {
          await this.handleReuseDetection(userId, session.id, command);
        }

        throw new UnauthorizedError(
          'Refresh token already rotated',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),
          userId: user.id,
          action: AuditAction.REFRESH,
          sessionId: session.id,
          ipAddress: command.ipAddress,
          userAgent: command.userAgent,
          deviceType: parseDeviceType(command.userAgent),
          metadata: {
            refreshed: true,
          },
        }),
      );

      this.logger.log(`🔄 Token refreshed: ${session.id}`);

      return new RefreshTokenResult(
        tokens.accessToken,
        tokens.refreshToken,
        tokens.accessTokenExpiresAt,
        tokens.refreshTokenExpiresAt,
      );
    } catch (error) {
      if (error instanceof DomainError) {
        mapDomainError(error);
      }

      throw error;
    }
  }

  private async handleReuseDetection(
    userId: string,
    sessionId: string,
    command: RefreshTokenCommand,
  ): Promise<never> {
    this.logger.error(`🚨 TOKEN REUSE DETECTED: ${sessionId}`);

    await this.sessionRepo.revokeAllByUserId(userId);

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),
        userId,
        action: AuditAction.SESSION_REVOKED,
        sessionId,
        ipAddress: command.ipAddress,
        userAgent: command.userAgent,
        deviceType: parseDeviceType(command.userAgent),
        metadata: {
          reason: 'TOKEN_REUSE_DETECTED',
        },
      }),
    );

    throw new UnauthorizedError(
      'Refresh token reuse detected',
      ERROR_CODES.TOKEN_REUSE_DETECTED,
    );
  }
}
