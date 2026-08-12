import { Inject, Logger } from '@nestjs/common';

import { ListBranchesQuery } from './list-branches.query';
import {
  ListBranchItemResult,
  ListBranchesResult,
} from './list-branches.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class ListBranchesHandler {
  private readonly logger = new Logger(
    ListBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: ListBranchesQuery,
  ): Promise<ListBranchesResult> {
    this.logger.log('List branches request received');

    const branches =
      await this.branchRepo.findAll({
        status: query.status,
        search: query.search,
        city: query.city,
        state: query.state,
        country: query.country,
        includeDeleted: query.includeDeleted,
        skip: query.skip,
        take: query.take,
      });

    const items = branches.map(
      (branch) =>
        new ListBranchItemResult(
          branch.id,
          branch.branchName.getValue(),
          branch.branchCode.getValue(),
          branch.email?.getValue() ?? null,
          branch.phone?.getValue() ?? null,
          branch.city,
          branch.state,
          branch.country,
          branch.status,
          branch.createdAt,
          branch.updatedAt,
        ),
    );

    return new ListBranchesResult(
      items,
      items.length,
    );
  }
}
