// application/handlers/login-user.handler.ts

import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { randomUUID } from 'crypto';
import { Inject, Logger } from '@nestjs/common';

import { LoginUserCommand } from './login-user.command';
import { LoginUserResult } from './login-user.result';

import type { UserRepository } from '../../domain/repositories/user.repository';
import type { SessionRepository } from '../../domain/repositories/session.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { Session } from '../../domain/entities/session.entity';
import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { UserDomainService } from '../../domain/services/user-domain.service';
import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { ValidationError } from '../errors/validation.error';

import { AUTH_TOKENS } from '../../auth.tokens';
import type { TokenPort } from '../ports/token.port';
import { User } from '../../domain/entities/user.entity';

// =====================
// 🔥 HELPERS
// =====================

const isEmail = (input: string): boolean => input.includes('@');

const normalizePhone = (input: string): string => {
  let phone = input.replace(/\D/g, '');

  if (phone.length === 10) return phone;

  if (phone.startsWith('91') && phone.length === 12) {
    return phone.slice(2);
  }

  throw new ValidationError(
    'Invalid phone number format',
    ERROR_CODES.USER_INVALID_PHONE,
  );
};

// 🔥 simple deviceType parser (you can replace with your util)
const parseDeviceType = (ua?: string | null): DeviceType => {
  if (!ua) return DeviceType.UNKNOWN;

  const lower = ua.toLowerCase();

  if (lower.includes('mobile')) return DeviceType.MOBILE;
  if (lower.includes('tablet')) return DeviceType.TABLET;

  return DeviceType.DESKTOP;
};

// =====================
// 🚀 HANDLER
// =====================

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

    private readonly userDomainService: UserDomainService,
  ) {}

  async execute(command: LoginUserCommand): Promise<LoginUserResult> {
    try {
      this.logger.log('🔐 Login request received');

      // =====================
      // 1️⃣ VALIDATION
      // =====================
      if (!command.identifier || !command.password) {
        throw new ValidationError(
          'Identifier and password are required',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      const rawIdentifier = command.identifier.trim().toLowerCase();

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
            deviceType: parseDeviceType(command.userAgent),
            metadata: {
              identifier: rawIdentifier,
              loginType,
            },
          }),
        );

        throw new ValidationError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
        );
      }

      // =====================
      // 4️⃣ DOMAIN CHECK
      // =====================
      this.userDomainService.ensureCanLogin(user);

      // =====================
      // 5️⃣ PASSWORD CHECK
      // =====================
      const isMatch = await bcrypt.compare(
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
            deviceType: parseDeviceType(command.userAgent),
            metadata: { loginType },
          }),
        );

        throw new ValidationError(
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
        email: user.email.getValue(), // 🔥 FIXED
        role: user.role,              // 🔥 FIXED
        sessionId,
      });

      const refreshTokenHash = crypto
        .createHash('sha256')
        .update(tokens.refreshToken)
        .digest('hex');

      const deviceType = parseDeviceType(command.userAgent);

      const session = Session.create({
        id: sessionId,
        userId: user.id,
        refreshTokenHash,
        userAgent: command.userAgent,
        ipAddress: command.ipAddress,
        deviceType, // 🔥 FIXED
        expiresAt: tokens.refreshTokenExpiresAt,
      });

      await this.sessionRepo.save(session);

      // =====================
      // 7️⃣ AUDIT SUCCESS
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
          metadata: { loginType },
        }),
      );

      this.logger.log(`✅ Login success: ${user.id}`);

      // =====================
      // 8️⃣ RESPONSE
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
        throw new ValidationError(error.message, error.code);
      }

      throw error;
    }
  }
}