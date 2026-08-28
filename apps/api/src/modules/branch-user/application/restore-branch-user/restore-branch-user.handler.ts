import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { RestoreBranchUserCommand } from './restore-branch-user.command';
import { RestoreBranchUserResult } from './restore-branch-user.result';

export class RestoreBranchUserHandler {
  private readonly logger = new Logger(RestoreBranchUserHandler.name);

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,
  ) {}

  async execute(
    command: RestoreBranchUserCommand,
  ): Promise<RestoreBranchUserResult> {
    this.logger.log(`Restore branch user request received: ${command.id}`);

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

    if (!branchUser.isRestorable()) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Branch user is already active',
        400,
      );
    }

    branchUser.restore(command.updatedBy);
    await this.branchUserRepo.save(branchUser);

    return new RestoreBranchUserResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.email.getValue(),
      branchUser.branchId,
      branchUser.isActive,
      branchUser.updatedAt,
    );
  }
}
