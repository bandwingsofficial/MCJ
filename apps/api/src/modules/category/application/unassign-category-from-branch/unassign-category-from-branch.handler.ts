import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { UnassignCategoryFromBranchCommand } from './unassign-category-from-branch.command';
import { UnassignCategoryFromBranchResult } from './unassign-category-from-branch.result';

export class UnassignCategoryFromBranchHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: UnassignCategoryFromBranchCommand,
  ): Promise<UnassignCategoryFromBranchResult> {
    const branch = await this.branchRepo.findById(
      command.branchId,
    );

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.categoryId, true),
    );

    await this.categoryRepo.unassignCategoryFromBranch(
      command.branchId,
      command.categoryId,
    );

    return new UnassignCategoryFromBranchResult(
      command.branchId,
      command.categoryId,
      true,
    );
  }
}
