import { randomUUID } from 'crypto';

import { Inject, Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';
import type { PasswordHasherPort } from '../../../auth/application/ports/password-hasher.port';
import type { TokenPort } from '../../../auth/application/ports/token.port';
import { hashToken } from '../../../auth/application/utils/token.util';
import { AUTH_TOKENS } from '../../../auth/auth.tokens';
import { LoginBranchUserCommand } from './login-branch-user.command';
import { LoginBranchUserResult } from './login-branch-user.result';
import { ValidationError } from '../errors/validation.error';

export class LoginBranchUserHandler {
  private readonly logger = new Logger(
    LoginBranchUserHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    @Inject(AUTH_TOKENS.PASSWORD_HASHER)
    private readonly passwordHasher: PasswordHasherPort,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: LoginBranchUserCommand,
  ): Promise<LoginBranchUserResult> {
    try {
      this.logger.log(
        'Branch user login request received',
      );

      const identifier =
        command.identifier.trim().toLowerCase();

      const branchUser = identifier.includes('@')
        ? await this.branchUserRepo.findByEmailIncludingDeleted(
            BranchUserEmail.create(identifier),
          )
        : await this.branchUserRepo.findByPhoneIncludingDeleted(
            BranchUserPhone.create(identifier),
          );

      if (!branchUser) {
        throw new ValidationError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
          undefined,
          401,
        );
      }

      branchUser.canLogin();

      const isMatch =
        await this.passwordHasher.compare(
          command.password,
          branchUser.password,
        );

      if (!isMatch) {
        throw new ValidationError(
          'Invalid credentials',
          ERROR_CODES.INVALID_CREDENTIALS,
          undefined,
          401,
        );
      }

      const sessionId = randomUUID();

      const tokens =
        await this.tokenPort.generateBranchUserTokenPair({
          branchUserId: branchUser.id,
          sessionId,
          branchId: branchUser.branchId,
          email: branchUser.email.getValue(),
          role: branchUser.role,
          permissions:
            branchUser.permissions,
        });

      branchUser.markLoggedIn(
        hashToken(tokens.refreshToken),
        tokens.refreshTokenExpiresAt,
      );

      await this.branchUserRepo.save(branchUser);

      return new LoginBranchUserResult(
        branchUser.id,
        branchUser.firstName.getValue(),
        branchUser.lastName?.getValue() ?? null,
        branchUser.email.getValue(),
        branchUser.phone?.getValue() ?? null,
        branchUser.role,
        branchUser.permissions,
        branchUser.branchId,
        sessionId,
        tokens.accessToken,
        tokens.refreshToken,
        tokens.accessTokenExpiresAt,
        tokens.refreshTokenExpiresAt,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new ValidationError(
        'Invalid credentials',
        ERROR_CODES.INVALID_CREDENTIALS,
        undefined,
        401,
      );
    }
  }
}
