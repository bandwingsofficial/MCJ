// application/register/register-user.handler.ts

import { Inject } from '@nestjs/common';

import { randomUUID } from 'crypto';
import { Role } from '@prisma/client';

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
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export class RegisterUserHandler {
  constructor(
    @Inject(AUTH_TOKENS.USER_REPOSITORY)
    private readonly userRepo: UserRepository,

    @Inject(AUTH_TOKENS.AUDIT_LOG_REPOSITORY)
    private readonly auditRepo: AuditLogRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,

    private readonly prisma: PrismaService,
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      const normalizedEmail = command.email.trim().toLowerCase();
      const normalizedPhone = command.phone?.trim();

      const emailVO = Email.create(normalizedEmail);
      const phoneVO = normalizedPhone ? Phone.create(normalizedPhone) : null;

      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: {
            equals: normalizedEmail,
            mode: 'insensitive',
          },
          deletedAt: null,
        },
        select: {
          id: true,
          role: true,
          lastLoginAt: true,
        },
      });

      let user: User;

      if (existingUser) {
        const claimable =
          existingUser.role === Role.STUDENT &&
          existingUser.lastLoginAt === null;

        if (!claimable) {
          throw new UserAlreadyExistsError('email');
        }

        const existing = await this.userRepo.findById(existingUser.id);

        if (!existing) {
          throw new UserAlreadyExistsError('email');
        }

        const passwordHash = await this.passwordHasher.hash(command.password);
        existing.changeName(command.name);
        existing.changePassword(passwordHash);

        if (phoneVO) {
          const phoneTaken = await this.prisma.user.findFirst({
            where: {
              phone: phoneVO.getValue(),
              deletedAt: null,
              NOT: { id: existing.id },
            },
            select: { id: true },
          });

          if (!phoneTaken) {
            existing.changePhone(phoneVO.getValue());
          }
        }

        await this.userRepo.save(existing);
        user = existing;
      } else {
        if (phoneVO && (await this.userRepo.existsByPhone(phoneVO))) {
          throw new UserAlreadyExistsError('phone');
        }

        const passwordHash = await this.passwordHasher.hash(command.password);

        user = User.create({
          id: randomUUID(),
          name: command.name,
          email: emailVO.getValue(),
          passwordHash,
          phone: phoneVO?.getValue(),
        });

        await this.userRepo.save(user);
      }

      await this.linkExistingStudentByEmail(user.id, normalizedEmail);

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

  private async linkExistingStudentByEmail(
    userId: string,
    email: string,
  ): Promise<void> {
    const student = await this.prisma.student.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
        isDeleted: false,
      },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!student || student.userId === userId) {
      return;
    }

    const occupied = await this.prisma.student.findFirst({
      where: {
        userId,
        isDeleted: false,
        NOT: { id: student.id },
      },
      select: { id: true },
    });

    if (occupied) {
      return;
    }

    await this.prisma.student.update({
      where: { id: student.id },
      data: {
        userId,
        updatedBy: userId,
      },
    });
  }
}
