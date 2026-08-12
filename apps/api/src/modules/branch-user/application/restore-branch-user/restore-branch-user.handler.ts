// src/modules/branch-user/application/restore-branch-user/restore-branch-user.handler.ts

import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';

import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';

import { BaseException } from '@common/exceptions/base.exception';

import { ValidationError } from '../errors/validation.error';

import { RestoreBranchUserCommand } from './restore-branch-user.command';
import { RestoreBranchUserResult } from './restore-branch-user.result';

import { BranchUserNotFoundException } from '../../domain/errors/branch-user-not-found.exception';

export class RestoreBranchUserHandler {
  private readonly logger = new Logger(
    RestoreBranchUserHandler.name,
  );

  constructor(
    @Inject(
      BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY,
    )
    private readonly branchUserRepo: BranchUserRepository,
  ) {}

  async execute(
    command: RestoreBranchUserCommand,
  ): Promise<RestoreBranchUserResult> {
    try {
      this.logger.log(
        `♻️ Restore branch user request received: ${command.id}`,
      );

      const branchUser =
        await this.branchUserRepo.findByIdIncludingDeleted(
          command.id,
        );

      if (!branchUser) {
        throw new BranchUserNotFoundException(
          command.id,
        );
      }

      if (!branchUser.isRestorable()) {
  throw new ValidationError(
    'Branch user is already active',
  );
}

branchUser.restore();

      await this.branchUserRepo.save(
        branchUser,
      );

      return new RestoreBranchUserResult(
        branchUser.id,
        branchUser.firstName.getValue(),
        branchUser.email.getValue(),
        branchUser.branchId,
        branchUser.isActive,
        branchUser.updatedAt,
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

      throw error;
    }
  }
}