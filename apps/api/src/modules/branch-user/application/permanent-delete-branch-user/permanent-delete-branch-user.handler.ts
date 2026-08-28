import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { PermanentDeleteBranchUserCommand } from './permanent-delete-branch-user.command';
import { PermanentDeleteBranchUserResult } from './permanent-delete-branch-user.result';

export class PermanentDeleteBranchUserHandler {
  private readonly logger = new Logger(PermanentDeleteBranchUserHandler.name);

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,
  ) {}

  async execute(
    command: PermanentDeleteBranchUserCommand,
  ): Promise<PermanentDeleteBranchUserResult> {
    this.logger.log(
      `Permanent delete branch user request received: ${command.id}`,
    );

    const branchUser = await this.branchUserRepo.findByIdIncludingDeleted(
      command.id,
    );

    if (!branchUser) {
      throw new BaseException(
        ERROR_CODES.BRANCH_USER_NOT_FOUND,
        'User not found.',
        404,
      );
    }

    if (!branchUser.isDeleted) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only deleted users can be permanently deleted.',
        400,
      );
    }

    await this.branchUserRepo.permanentDelete(branchUser.id);

    this.logger.log(
      `Branch user permanently deleted: ${branchUser.id} by ${command.deletedBy}`,
    );

    return new PermanentDeleteBranchUserResult(branchUser.id, true);
  }
}
