// application/admin/login-admin.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { LoginAdminCommand } from './login-admin.command';
import { LoginAdminResult } from './login-admin.result';

import type { UserRepository } from '../../../domain/repositories/user.repository';

import type { AuditLogRepository } from '../../../domain/repositories/audit-log.repository';

import type { PasswordHasherPort } from '../../ports/password-hasher.port';

import { UserDomainService } from '../../../domain/services/user-domain.service';

import { Email } from '../../../domain/value-objects/email.vo';

import { AuditLog } from '../../../domain/entities/audit-log.entity';

import { AuditAction } from '../../../domain/enums/audit-action.enum';
import { Role } from '../../../domain/enums/role.enum';

import { DomainError } from '../../../domain/errors/domain.error';
import { ERROR_CODES } from '../../../domain/errors/error-codes';

import { UnauthorizedError } from '../../errors/unauthorized.error';

import { AUTH_TOKENS } from '../../../auth.tokens';

import { parseDeviceType } from '../../utils/device.util';

import type { TokenPort } from '../../ports/token.port';

import { mapDomainError } from '../../utils/map-domain-error.util';

export class LoginAdminHandler {
  private readonly logger = new Logger(LoginAdminHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    private readonly domainService: UserDomainService,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: LoginAdminCommand): Promise<LoginAdminResult> {
    try {
      this.logger.log('🔐 Admin login request received');

      // =====================
      // 1️⃣ VALIDATION
      // =====================

      if (!command.email?.trim() || !command.password) {
        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      const normalizedEmail = command.email.trim().toLowerCase();

      const deviceType = parseDeviceType(command.userAgent);

      // =====================
      // 2️⃣ FIND USER
      // =====================

      const emailVO = Email.create(normalizedEmail);

      const user = await this.userRepo.findByEmail(emailVO);

      // =====================
      // 3️⃣ USER NOT FOUND
      // =====================

      if (!user) {
        this.logger.warn(`❌ Admin not found: ${normalizedEmail}`);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),

            action: AuditAction.ADMIN_LOGIN_FAILED,

            ipAddress: command.ipAddress,

            userAgent: command.userAgent,

            deviceType,

            metadata: {
              email: normalizedEmail,
            },
          }),
        );

        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // =====================
      // 4️⃣ ADMIN CHECK
      // =====================

      if (user.role !== Role.ADMIN) {
        this.logger.warn(`🚨 Non-admin attempted admin login: ${user.id}`);

        throw new UnauthorizedError(
          'Unauthorized access',
          ERROR_CODES.UNAUTHORIZED,
        );
      }

      // =====================
      // 5️⃣ DOMAIN CHECKS
      // =====================

      user.canLogin();

      this.domainService.ensureAdminHasMfa(user);

      // =====================
      // 6️⃣ PASSWORD CHECK
      // =====================

      const isMatch = await this.passwordHasher.compare(
        command.password,
        user.passwordHash,
      );

      if (!isMatch) {
        this.logger.warn(`❌ Invalid admin password: ${user.id}`);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),

            userId: user.id,

            action: AuditAction.ADMIN_LOGIN_FAILED,

            ipAddress: command.ipAddress,

            userAgent: command.userAgent,

            deviceType,

            metadata: {
              email: normalizedEmail,
            },
          }),
        );

        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // =====================
      // 🔐 MFA REQUIRED
      // =====================

      const mfaToken = await this.tokenPort.generateMfaToken({
        userId: user.id,

        email: user.email.getValue(),

        role: user.role,
      });

      this.logger.log(`🔒 Admin MFA required: ${user.id}`);

      // 🔥 next step:
      // verify-admin-totp.handler.ts

      return new LoginAdminResult(
        user.id,

        user.email.getValue(),

        user.name,

        user.role,

        true,

        mfaToken,
      );
    } catch (error) {
      if (error instanceof DomainError) {
        mapDomainError(error);
      }

      throw error;
    }
  }
}
