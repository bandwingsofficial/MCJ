import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { BranchUserDomainService } from '../../domain/services/branch-user-domain.service';
import { GetBranchUserQuery } from './get-branch-user.query';
import { GetBranchUserResult } from './get-branch-user.result';

import { BRANCH_TOKENS } from '@/modules/branch/branch.tokens';
import type { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';

import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

export class GetBranchUserHandler {
  private readonly logger = new Logger(GetBranchUserHandler.name);

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchUserDomainService,
  ) {}

  async execute(query: GetBranchUserQuery): Promise<GetBranchUserResult> {
    this.logger.log('Get branch user request received');

    const branchUser = await this.branchUserRepo.findById(
      query.branchUserId,
    );

    this.domainService.ensureExists(branchUser);

    const branch = await this.branchRepo.findById(
      branchUser.branchId,
    );

    if (!branch) {
      throw new BranchNotFoundException(
        branchUser.branchId,
      );
    }

    return new GetBranchUserResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.lastName?.getValue() ?? null,
      branchUser.email.getValue(),
      branchUser.phone?.getValue() ?? null,
      branchUser.role,
      branchUser.permissions,

      branchUser.branchId,

      branch.branchName.getValue(),
      branch.branchCode.getValue(),

      branchUser.isActive,
      branchUser.lastLoginAt,
      branchUser.createdBy,
      branchUser.updatedBy,
      branchUser.createdAt,
      branchUser.updatedAt,
    );
  }
}