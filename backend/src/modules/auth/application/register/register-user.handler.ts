// application/handlers/register-user.handler.ts

import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Inject } from '@nestjs/common';

import { RegisterUserCommand } from './register-user.command';
import { RegisterUserResult } from './register-user.result';

import type { UserRepository } from '../../domain/repositories/user.repository';
import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { User } from '../../domain/entities/user.entity';
import { Email } from '../../domain/value-objects/email.vo';
import { Phone } from '../../domain/value-objects/phone.vo';
import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';
import { DeviceType } from '../../domain/enums/device-type.enum';

import { DomainError } from '../../domain/errors/domain.error';
import { ERROR_CODES } from '../../domain/errors/error-codes';

import { UserAlreadyExistsError } from '../errors/user-already-exists.error';
import { ValidationError } from '../errors/validation.error';

import { AUTH_TOKENS } from '../../auth.tokens';

export class RegisterUserHandler {
  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      // 1️⃣ Validate input
      this.validate(command);

      // 2️⃣ Value Objects
      const emailVO = Email.create(command.email);
      const phoneVO = command.phone ? Phone.create(command.phone) : null;

      // 🔥 3️⃣ Fast uniqueness checks (better than full fetch)
      if (await this.userRepo.existsByEmail(emailVO)) {
        throw new UserAlreadyExistsError('email');
      }

      if (phoneVO && (await this.userRepo.existsByPhone(phoneVO))) {
        throw new UserAlreadyExistsError('phone');
      }

      // 4️⃣ Hash password
      const passwordHash = await bcrypt.hash(command.password, 10);

      // 5️⃣ Create domain user
      const user = User.create({
        id: randomUUID(),
        name: command.name,
        email: emailVO.getValue(),
        passwordHash,
        phone: phoneVO?.getValue(),
      });

      // 6️⃣ Persist
      await this.userRepo.save(user);

      // 🔥 7️⃣ Audit log
      await this.auditRepo.create(
        AuditLog.create({
          id: randomUUID(),
          userId: user.id,
          action: AuditAction.REGISTER,
          ipAddress: command.ipAddress ?? null,
          userAgent: command.userAgent ?? null,
          deviceType: DeviceType.UNKNOWN, // 🔥 can improve later
        }),
      );

      // 8️⃣ Result
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

  private validate(command: RegisterUserCommand) {
    if (!command.name?.trim()) {
      throw new ValidationError(
        'Name is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (!command.email?.trim()) {
      throw new ValidationError(
        'Email is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (!command.password) {
      throw new ValidationError(
        'Password is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    if (command.password.length < 6) {
      throw new ValidationError(
        'Password must be at least 6 characters',
        ERROR_CODES.USER_PASSWORD_INVALID,
      );
    }
  }
}