import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { UpdateBranchUserStatusCommand } from './update-branch-user-status.command';
import { UpdateBranchUserStatusResult } from './update-branch-user-status.result';

export class UpdateBranchUserStatusHandler {
  private readonly logger = new Logger(
    UpdateBranchUserStatusHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: UpdateBranchUserStatusCommand,
  ): Promise<UpdateBranchUserStatusResult> {
    this.logger.log(
      'Update branch user status request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        command.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    if (command.isActive) {
      branchUser.activate(command.updatedBy);
    } else {
      branchUser.deactivate(command.updatedBy);
      branchUser.revokeRefreshToken();
    }

    await this.branchUserRepo.save(branchUser);

    return new UpdateBranchUserStatusResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.email.getValue(),
      branchUser.branchId,
      branchUser.isActive,
      branchUser.updatedAt,
    );
  }
}
