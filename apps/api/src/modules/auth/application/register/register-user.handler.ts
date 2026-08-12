// application/register/register-user.handler.ts

import { Inject } from '@nestjs/common';

import { randomUUID } from 'crypto';

import { RegisterUserCommand } from './register-user.command';
import { RegisterUserResult } from './register-user.result';

import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import type { PasswordHasherPort } from '../ports/password-hasher.port';

import { User } from '../../domain/entities/user.entity';
import { AuditLog } from '../../domain/entities/audit-log.entity';

import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { DomainError } from '../../domain/errors/domain.error';

import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { ValidationError } from '../errors/validation.error';

import { AUTH_TOKENS } from '../../auth.tokens';

export class RegisterUserHandler {
  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      // =====================
      // 🔍 NORMALIZE
      // =====================

      const normalizedEmail = command.email.trim().toLowerCase();
      const normalizedPhone = command.phone?.trim();

      // =====================
      // 🧠 VALUE OBJECTS
      // =====================

      const emailVO = Email.create(normalizedEmail);

      const phoneVO = normalizedPhone ? Phone.create(normalizedPhone) : null;

      // =====================
      // 🚫 UNIQUENESS
      // =====================

      if (await this.userRepo.existsByEmail(emailVO)) {
        throw new UserAlreadyExistsError('email');
      }

      if (phoneVO && (await this.userRepo.existsByPhone(phoneVO))) {
        throw new UserAlreadyExistsError('phone');
      }

      // =====================
      // 🔐 HASH PASSWORD
      // =====================

      const passwordHash = await this.passwordHasher.hash(command.password);

      // =====================
      // 👤 CREATE USER
      // =====================

      const user = User.create({
        id: randomUUID(),

        name: command.name,

        email: emailVO.getValue(),

        passwordHash,

        phone: phoneVO?.getValue(),
      });

      // =====================
      // 💾 SAVE
      // =====================

      await this.userRepo.save(user);

      // =====================
      // 📝 AUDIT
      // =====================

      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),

          userId: user.id,

          action: AuditAction.REGISTER,

          ipAddress: command.ipAddress ?? null,

          userAgent: command.userAgent ?? null,

          deviceType: DeviceType.UNKNOWN,
        }),
      );

      // =====================
      // ✅ RESULT
      // =====================

      return new RegisterUserResult(
        user.id,

        user.email.getValue(),

        user.name,

        user.role,

        user.createdAt,
      );
    } catch (error) {
      if (error instanceof DomainError) {
        throw new ValidationError(error.message, error.code);
      }

      throw error;
    }
  }
}
