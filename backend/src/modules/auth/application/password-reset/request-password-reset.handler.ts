import { Inject, Logger } from '@nestjs/common';

import * as crypto from 'crypto';

import { randomUUID } from 'crypto';

import { RequestPasswordResetCommand } from './request-password-reset.command';

import { RequestPasswordResetResult } from './request-password-reset.result';

import type { UserRepository } from '../../domain/repositories/user.repository';

import type { PasswordResetRepository } from '../../domain/repositories/password-reset.repository';

import type { AuditLogRepository } from '../../domain/repositories/audit-log.repository';

import { Email } from '../../domain/value-objects/email.vo';

import { PasswordResetToken } from '../../domain/entities/password-reset-token.entity';

import { AuditLog } from '../../domain/entities/audit-log.entity';

import { AuditAction } from '../../domain/enums/audit-action.enum';

import { DeviceType } from '../../domain/enums/device-type.enum';

import { AUTH_TOKENS } from '../../auth.tokens';

import { ValidationError } from '../errors/validation.error';

import { ERROR_CODES } from '../../domain/errors/error-codes';

// =====================
// CONFIG
// =====================

const COOLDOWN_MS =
  60 * 1000;

// =====================
// DEVICE PARSER
// =====================

const parseDeviceType = (
  ua?: string | null,
): DeviceType => {
  if (!ua) {
    return DeviceType.UNKNOWN;
  }

  const l = ua.toLowerCase();

  if (
    l.includes('mobile')
  ) {
    return DeviceType.MOBILE;
  }

  if (
    l.includes('tablet')
  ) {
    return DeviceType.TABLET;
  }

  return DeviceType.DESKTOP;
};

export class RequestPasswordResetHandler {
  private readonly logger =
    new Logger(
      RequestPasswordResetHandler.name,
    );

  constructor(
    @Inject(
      AUTH_TOKENS.USER_REPOSITORY,
    )
    private readonly userRepo: UserRepository,

    @Inject(
      AUTH_TOKENS.PASSWORD_RESET_REPOSITORY,
    )
    private readonly resetRepo: PasswordResetRepository,

    @Inject(
      AUTH_TOKENS.AUDIT_LOG_REPOSITORY,
    )
    private readonly auditRepo: AuditLogRepository,
  ) {}

  async execute(
    command: RequestPasswordResetCommand,
  ): Promise<RequestPasswordResetResult> {
    // =====================
    // VALIDATION
    // =====================

    if (
      !command.email?.trim()
    ) {
      throw new ValidationError(
        'Email is required',
        ERROR_CODES.VALIDATION_ERROR,
      );
    }

    const emailVO =
      Email.create(
        command.email,
      );

    // =====================
    // FIND USER
    // =====================

    const user =
      await this.userRepo.findByEmail(
        emailVO,
      );

    // =====================
    // EMAIL NOT FOUND
    // =====================

    if (!user) {
      this.logger.warn(
        `⚠️ Reset requested for non-existing email`,
      );

      throw new ValidationError(
        'Email is not registered',
        ERROR_CODES.USER_NOT_FOUND,
      );
    }

    // =====================
    // COOLDOWN CHECK
    // =====================

    const lastToken =
      await this.resetRepo.findLatestByUserId(
        user.id,
      );

    if (lastToken) {
      const elapsed =
        Date.now() -
        lastToken.createdAt.getTime();

      const remaining =
        COOLDOWN_MS -
        elapsed;

      if (
        remaining > 0
      ) {
        const seconds =
          Math.ceil(
            remaining / 1000,
          );

        throw new ValidationError(
          `Please wait ${seconds} seconds before requesting OTP again`,
          ERROR_CODES.TOO_MANY_REQUESTS,
          {
            retryAfter:
              seconds,

            retryAt:
              new Date(
                Date.now() +
                  remaining,
              ),
          },
        );
      }
    }

    // =====================
    // CLEAN OLD TOKENS
    // =====================

    await this.resetRepo.deleteExpiredByUserId(
      user.id,
    );

    // =====================
    // GENERATE OTP
    // =====================

    const otp =
      Math.floor(
        100000 +
          Math.random() *
            900000,
      ).toString();

    const otpHash =
      crypto
        .createHash(
          'sha256',
        )
        .update(otp)
        .digest('hex');

    const token =
      PasswordResetToken.create(
        {
          id: randomUUID(),

          userId:
            user.id,

          otpHash,

          expiresAt:
            new Date(
              Date.now() +
                10 *
                  60 *
                  1000,
            ),
        },
      );

    await this.resetRepo.save(
      token,
    );

    // =====================
    // SEND OTP
    // =====================

    this.logger.log(
      `📩 OTP for ${user.email.getValue()} → ${otp}`,
    );

    // =====================
    // AUDIT LOG
    // =====================

    await this.auditRepo.create(
      AuditLog.create({
        id: randomUUID(),

        userId:
          user.id,

        action:
          AuditAction.PASSWORD_RESET_REQUESTED,

        ipAddress:
          command.ipAddress,

        userAgent:
          command.userAgent,

        deviceType:
          parseDeviceType(
            command.userAgent,
          ),
      }),
    );

    // =====================
    // SUCCESS
    // =====================

    return new RequestPasswordResetResult(
      'OTP sent to your email',
    );
  }
}