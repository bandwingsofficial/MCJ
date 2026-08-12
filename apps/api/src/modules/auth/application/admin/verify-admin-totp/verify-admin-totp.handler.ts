// application/admin/verify-admin-totp.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { VerifyAdminTotpCommand } from './verify-admin-totp.command';
import { VerifyAdminTotpResult } from './verify-admin-totp.result';

import type { UserRepository } from '../../../domain/repositories/user.repository';
import type { SessionRepository } from '../../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';

import type { TokenPort, MfaTokenPayload } from '../../ports/token.port';
import type { TotpPort } from '../../ports/totp.port';

import { Session } from '../../../domain/entities/session.entity';
import { AuditLog } from '../../../domain/entities/audit-log.entity';

import { AuditAction } from '../../../domain/enums/audit-action.enum';
import { Role } from '../../../domain/enums/role.enum';

import { DomainError } from '../../../domain/errors/domain.error';
import { ERROR_CODES } from '../../../domain/errors/error-codes';

import { UnauthorizedError } from '../../errors/unauthorized.error';
import { ValidationError } from '../../errors/validation.error';

import { AUTH_TOKENS } from '../../../auth.tokens';

import { parseDeviceType } from '../../utils/device.util';
import { hashToken } from '../../utils/token.util';
import { mapDomainError } from '../../utils/map-domain-error.util';

export class VerifyAdminTotpHandler {
  private readonly logger = new Logger(VerifyAdminTotpHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    @Inject(AUTH_TOKENS.TOTP_PORT)
    private readonly totpPort: TotpPort,
  ) {}

  async execute(
    command: VerifyAdminTotpCommand,
  ): Promise<VerifyAdminTotpResult> {
    try {
      this.logger.log('🔐 Admin TOTP verification started');

      // =====================
      // 1️⃣ VALIDATION
      // =====================

      if (!command.mfaToken || !command.totpCode) {
        throw new ValidationError(
          'MFA token and TOTP code are required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      // =====================
      // 2️⃣ VERIFY MFA TOKEN
      // =====================

      let payload: MfaTokenPayload;

      try {
        payload = await this.tokenPort.verifyMfaToken(command.mfaToken);

        if (payload.type !== 'ADMIN_MFA') {
          throw new UnauthorizedError(
            'Invalid MFA token',
            ERROR_CODES.INVALID_TOKEN,
          );
        }
      } catch (error) {
        if (error instanceof UnauthorizedError) {
          throw error;
        }

        throw new UnauthorizedError(
          'Invalid MFA token',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      // =====================
      // 3️⃣ GET ADMIN
      // =====================

      const admin = await this.userRepo.findById(payload.sub);

      if (!admin) {
        throw new UnauthorizedError(
          'Admin not found',
          ERROR_CODES.USER_NOT_FOUND,
        );
      }

      // =====================
      // 4️⃣ ADMIN CHECK
      // =====================

      if (admin.role !== Role.ADMIN) {
        throw new UnauthorizedError(
          'Unauthorized access',
          ERROR_CODES.UNAUTHORIZED,
        );
      }

      // =====================
      // 5️⃣ MFA CHECK
      // =====================

      if (!admin.mfaEnabled || !admin.mfaSecret) {
        throw new UnauthorizedError(
          'MFA is not enabled',
          ERROR_CODES.ADMIN_MFA_REQUIRED,
        );
      }

      // =====================
      // 6️⃣ VERIFY TOTP
      // =====================

      const isValid = await this.totpPort.verify({
        secret: admin.mfaSecret,

        token: command.totpCode,
      });

      const deviceType = parseDeviceType(command.userAgent);

      if (!isValid) {
        this.logger.warn(`❌ Invalid admin TOTP: ${admin.id}`);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),

            userId: admin.id,

            action: AuditAction.ADMIN_MFA_FAILED,

            ipAddress: command.ipAddress,

            userAgent: command.userAgent,

            deviceType,
          }),
        );

        throw new UnauthorizedError(
          'Invalid TOTP code',
          ERROR_CODES.INVALID_TOKEN,
        );
      }

      // =====================
      // 7️⃣ CREATE SESSION
      // =====================

      const sessionId = randomUUID();

      const tokens = await this.tokenPort.generateTokenPair({
        userId: admin.id,

        sessionId,

        email: admin.email.getValue(),

        role: admin.role,
      });

      const refreshTokenHash = hashToken(tokens.refreshToken);

      const session = Session.create({
        id: sessionId,

        userId: admin.id,

        refreshTokenHash,

        userAgent: command.userAgent,

        ipAddress: command.ipAddress,

        deviceType,

        expiresAt: tokens.refreshTokenExpiresAt,
      });

      await this.sessionRepo.save(session);

      // =====================
      // 🧠 UPDATE LOGIN
      // =====================

      await this.userRepo.updateLastLoginAt(admin.id, new Date());

      // =====================
      // 📝 AUDIT SUCCESS
      // =====================

      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),

          userId: admin.id,

          action: AuditAction.ADMIN_MFA_SUCCESS,

          sessionId: session.id,

          ipAddress: command.ipAddress,

          userAgent: command.userAgent,

          deviceType,

          metadata: {
            mfa: true,
          },
        }),
      );

      this.logger.log(`✅ Admin MFA verified: ${admin.id}`);

      // =====================
      // ✅ RESPONSE
      // =====================

      return new VerifyAdminTotpResult(
        admin.id,

        admin.email.getValue(),

        admin.name,

        admin.role,

        session.id,

        true,

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
}
