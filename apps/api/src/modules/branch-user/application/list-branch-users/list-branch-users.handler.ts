import { Inject, Logger } from '@nestjs/common';

import { BRANCH_USER_TOKENS } from '../../branch-user.tokens';
import type { BranchUserRepository } from '../../domain/repositories/branch-user.repository';
import { ListBranchUsersQuery } from './list-branch-users.query';
import {
  ListBranchUserItemResult,
  ListBranchUsersResult,
} from './list-branch-users.result';
import { BRANCH_TOKENS } from '@/modules/branch/branch.tokens';
import type { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';

export class ListBranchUsersHandler {
  private readonly logger = new Logger(
    ListBranchUsersHandler.name,
  );

  constructor(
    @Inject(BRANCH_USER_TOKENS.BRANCH_USER_REPOSITORY)
    private readonly branchUserRepo: BranchUserRepository,

      @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
      private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: ListBranchUsersQuery,
  ): Promise<ListBranchUsersResult> {
    this.logger.log(
      'List branch users request received',
    );

    const branchUsers =
      await this.branchUserRepo.findAll({
        branchId: query.branchId,
        role: query.role,
        isActive: query.isActive,
        search: query.search,
        includeDeleted: query.includeDeleted,
        skip: query.skip,
        take: query.take,
      });

    const items = await Promise.all(
  branchUsers.map(async (branchUser) => {
    const branch = await this.branchRepo.findById(
      branchUser.branchId,
    );

    return new ListBranchUserItemResult(
      branchUser.id,
      branchUser.firstName.getValue(),
      branchUser.lastName?.getValue() ?? null,
      branchUser.email.getValue(),
      branchUser.phone?.getValue() ?? null,
      branchUser.role,
      branchUser.permissions,
      branchUser.branchId,
      branch?.branchName.getValue() ?? '',
      branch?.branchCode.getValue() ?? '',
      branchUser.isActive,
      branchUser.lastLoginAt,
      branchUser.createdAt,
      branchUser.updatedAt,
    );
  }),
);

    return new ListBranchUsersResult(
      items,
      items.length,
    );
  }
}
