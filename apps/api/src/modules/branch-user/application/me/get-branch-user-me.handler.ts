import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { GetBranchUserMeQuery } from './get-branch-user-me.query';
import { GetBranchUserMeResult } from './get-branch-user-me.result';

export class GetBranchUserMeHandler {
  private readonly logger = new Logger(
    GetBranchUserMeHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(
    query: GetBranchUserMeQuery,
  ): Promise<GetBranchUserMeResult> {
    this.logger.log(
      'Get current branch user request received',
    );

    const branchUser =
      await this.branchUserRepo.findById(
        query.branchUserId,
      );

    this.domainService.ensureExists(branchUser);

    return new GetBranchUserMeResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.lastName?.getValue() ?? null,
      branchUser.email.getValue(),
      branchUser.phone?.getValue() ?? null,
      branchUser.role,
      branchUser.permissions,
      branchUser.branchId,
      branchUser.isActive,
      branchUser.lastLoginAt,
    );
  }
}
