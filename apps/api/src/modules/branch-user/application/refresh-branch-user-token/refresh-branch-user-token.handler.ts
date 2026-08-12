import { Inject, Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { hashToken } from '../../../auth/application/utils/token.util';
import type { TokenPort } from '../../../auth/application/ports/token.port';
import { AUTH_TOKENS } from '../../../auth/auth.tokens';
import { RefreshBranchUserTokenCommand } from './refresh-branch-user-token.command';
import { RefreshBranchUserTokenResult } from './refresh-branch-user-token.result';
import { ValidationError } from '../errors/validation.error';

export class RefreshBranchUserTokenHandler {
  private readonly logger = new Logger(
    RefreshBranchUserTokenHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    @Inject(AUTH_TOKENS.TOKEN_PORT)
    private readonly tokenPort: TokenPort,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: RefreshBranchUserTokenCommand,
  ): Promise<RefreshBranchUserTokenResult> {
    try {
      this.logger.log(
        'Branch user refresh token request received',
      );

      const payload =
        await this.tokenPort.verifyBranchUserRefreshToken(
          command.refreshToken,
        );

      const branchUser =
        await this.branchUserRepo.findById(
          payload.sub,
        );

      this.domainService.ensureExists(
        branchUser,
      );
      branchUser.canLogin();

      const incomingHash = hashToken(
        command.refreshToken,
      );

      if (
        !branchUser.refreshToken ||
        branchUser.refreshToken !== incomingHash ||
        !branchUser.refreshTokenExpiresAt ||
        branchUser.refreshTokenExpiresAt <
          new Date()
      ) {
        branchUser.revokeRefreshToken();
        await this.branchUserRepo.save(
          branchUser,
        );

        throw new ValidationError(
          'Invalid refresh token',
          ERROR_CODES.INVALID_TOKEN,
          undefined,
          401,
        );
      }

      const tokens =
        await this.tokenPort.generateBranchUserTokenPair({
          branchUserId: branchUser.id,
          sessionId: payload.sessionId,
          branchId: branchUser.branchId,
          email: branchUser.email.getValue(),
          role: branchUser.role,
          permissions:
            branchUser.permissions,
        });

      const newHash = hashToken(tokens.refreshToken);

      const rotated =
        await this.branchUserRepo.rotateRefreshTokenIfMatches(
          {
            branchUserId: branchUser.id,
            expectedHash: incomingHash,
            newHash,
            expiresAt: tokens.refreshTokenExpiresAt,
          },
        );

      if (!rotated) {
        branchUser.revokeRefreshToken();
        await this.branchUserRepo.save(branchUser);

        throw new ValidationError(
          'Refresh token already rotated',
          ERROR_CODES.INVALID_TOKEN,
          undefined,
          401,
        );
      }

      return new RefreshBranchUserTokenResult(
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
        'Invalid refresh token',
        ERROR_CODES.INVALID_TOKEN,
        undefined,
        401,
      );
    }
  }
}
