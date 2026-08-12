import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { LogoutBranchUserCommand } from './logout-branch-user.command';
import { LogoutBranchUserResult } from './logout-branch-user.result';

export class LogoutBranchUserHandler {
  private readonly logger = new Logger(
    LogoutBranchUserHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    command: LogoutBranchUserCommand,
  ): Promise<LogoutBranchUserResult> {
    this.logger.log(
      'Branch user logout request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        command.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    branchUser.revokeRefreshToken();

    await this.branchUserRepo.save(branchUser);

    return new LogoutBranchUserResult(
      'Logged out successfully',
    );
  }
}
