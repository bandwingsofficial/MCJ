import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { DeleteBranchUserCommand } from './delete-branch-user.command';
import { DeleteBranchUserResult } from './delete-branch-user.result';

export class DeleteBranchUserHandler {
  private readonly logger = new Logger(
    DeleteBranchUserHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: DeleteBranchUserCommand,
  ): Promise<DeleteBranchUserResult> {
    this.logger.log(
      'Delete branch user request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        command.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    branchUser.softDelete(command.updatedBy);
    branchUser.revokeRefreshToken();

    await this.branchUserRepo.save(branchUser);

    return new DeleteBranchUserResult(
      true,
      'Branch user deleted successfully',
    );
  }
}
