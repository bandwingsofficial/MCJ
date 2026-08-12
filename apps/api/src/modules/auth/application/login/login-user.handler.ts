// application/login/login-user.handler.ts

import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { LoginUserCommand } from './login-user.command';
import { LoginUserResult } from './login-user.result';

import type { UserRepository } from '../../domain/repositories/user.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { UserDomainService } from '../../domain/services/user-domain.service';

import type { PasswordHasherPort } from '../ports/password-hasher.port';
import type { TokenPort } from '../ports/token.port';
import type { AuthRateLimiterPort } from '../ports/auth-rate-limiter.port';

import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

import { Session } from '../../domain/entities/session.entity';
import { AuditLog } from '../../domain/entities/audit-log.entity';
import { User } from '../../domain/entities/user.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { ClientType } from '../../domain/enums/client-type.enum';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { UnauthorizedError } from '../errors/unauthorized.error';

import { AUTH_TOKENS } from '../../auth.tokens';

import { isEmail, normalizePhone } from '../utils/phone.util';
import { hashToken } from '../utils/token.util';
import { mapDomainError } from '../utils/map-domain-error.util';

import { parseDeviceType } from '../utils/device.util';

const LOGIN_MAX_ATTEMPTS = 10;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export class LoginUserHandler {
  private readonly logger = new Logger(LoginUserHandler.name);

  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.SESSION_REPOSITORY)
    private readonly sessionRepo: SessionRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    private readonly domainService: UserDomainService,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,

    @Inject(AUTH_TOKENS.AUTH_RATE_LIMITER)
    private readonly rateLimiter: AuthRateLimiterPort,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    try {
      this.logger.log('🔐 Login request received');

      // =====================
      // 1️⃣ VALIDATION
      // =====================

      if (!command.identifier?.trim() || !command.password) {
        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      const rawIdentifier = command.identifier.trim().toLowerCase();

      this.rateLimiter.consume({
        key: `login:ip:${command.ipAddress ?? 'unknown'}`,
        maxAttempts: LOGIN_MAX_ATTEMPTS,
        windowMs: LOGIN_WINDOW_MS,
      });

      this.rateLimiter.consume({
        key: `login:id:${rawIdentifier}`,
        maxAttempts: LOGIN_MAX_ATTEMPTS,
        windowMs: LOGIN_WINDOW_MS,
      });

      let user: User | null = null;

      let loginType: 'EMAIL' | 'PHONE';

      // =====================
      // 2️⃣ IDENTIFY USER
      // =====================

      if (isEmail(rawIdentifier)) {
        loginType = 'EMAIL';

        const emailVO = Email.create(rawIdentifier);

        user = await this.userRepo.findByEmail(emailVO);
      } else {
        loginType = 'PHONE';

        const normalizedPhone = normalizePhone(rawIdentifier);

        const phoneVO = Phone.create(normalizedPhone);

        user = await this.userRepo.findByPhone(phoneVO);
      }

      const deviceType = parseDeviceType(command.userAgent);

      // =====================
      // 3️⃣ USER NOT FOUND
      // =====================

      if (!user) {
        this.logger.warn(`❌ User not found: ${rawIdentifier}`);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),

            action: AuditAction.LOGIN_FAILED,

            ipAddress: command.ipAddress,

            userAgent: command.userAgent,

            deviceType,

            metadata: {
              identifier: rawIdentifier,

              loginType,
            },
          }),
        );

        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // =====================
      // 4️⃣ DOMAIN CHECK
      // =====================

      user.canLogin();

      this.domainService.ensureAdminHasMfa(user);

      // 🚫 BLOCK ADMIN LOGIN
      if (user.isAdmin()) {
        this.logger.warn(`🚨 Admin attempted user login: ${user.id}`);

        throw new UnauthorizedError(
          'Please use admin login url',
          ERROR_CODES.UNAUTHORIZED,
        );
      }

      // =====================
      // 5️⃣ PASSWORD CHECK
      // =====================

      const isMatch = await this.passwordHasher.compare(
        command.password,
        user.passwordHash,
      );

      if (!isMatch) {
        this.logger.warn(`❌ Invalid password: ${user.id}`);

        await this.auditRepo.create(
          AuditLog.create({
            id: randomUUID(),

            userId: user.id,

            action: AuditAction.LOGIN_FAILED,

            ipAddress: command.ipAddress,

            userAgent: command.userAgent,

            deviceType,

            metadata: {
              loginType,
            },
          }),
        );

        throw new UnauthorizedError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // =====================
      // 6️⃣ CREATE SESSION
      // =====================

      const sessionId = randomUUID();

      const tokens = await this.tokenPort.generateTokenPair({
        userId: user.id,

        email: user.email.getValue(),

        role: user.role,

        sessionId,
      });

      const refreshTokenHash = hashToken(tokens.refreshToken);

      const session = Session.create({
        id: sessionId,

        userId: user.id,

        refreshTokenHash,

        clientType: command.clientType ?? ClientType.WEB,

        userAgent: command.userAgent,

        ipAddress: command.ipAddress,

        deviceType,

        expiresAt: tokens.refreshTokenExpiresAt,
      });

      await this.sessionRepo.save(session);

      // =====================
      // 🧠 UPDATE LOGIN
      // =====================

      await this.userRepo.updateLastLoginAt(user.id, new Date());

      // =====================
      // 📝 AUDIT SUCCESS
      // =====================

      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),

          userId: user.id,

          action: AuditAction.LOGIN,

          sessionId: session.id,

          ipAddress: command.ipAddress,

          userAgent: command.userAgent,

          deviceType,

          metadata: {
            loginType,
          },
        }),
      );

      this.logger.log(`✅ Login success: ${user.id}`);

      // =====================
      // ✅ RESPONSE
      // =====================

      return new LoginUserResult(
        user.id,

        user.email.getValue(),

        user.name,

        user.role,

        session.id,

        loginType,

        user.phone ? user.phone.getValue() : null,

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
