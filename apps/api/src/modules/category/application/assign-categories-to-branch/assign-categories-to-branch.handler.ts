import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/student/domain/errors/branch-not-found.exception';

import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';

import { AssignCategoriesToBranchCommand } from './assign-categories-to-branch.command';
import { AssignCategoriesToBranchResult } from './assign-categories-to-branch.result';

export class AssignCategoriesToBranchHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: AssignCategoriesToBranchCommand,
  ): Promise<AssignCategoriesToBranchResult> {
    const branch = await this.branchRepo.findById(
      command.branchId,
    );

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const uniqueIds = [
      ...new Set(command.categoryIds.filter(Boolean)),
    ];

    if (uniqueIds.length === 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Select at least one category to assign',
        400,
      );
    }

    for (const categoryId of uniqueIds) {
      const category = await this.categoryRepo.findById(
        categoryId,
      );

      if (!category || category.isDeleted) {
        throw new BaseException(
          ERROR_CODES.CATEGORY_NOT_FOUND,
          'Category not found',
          404,
        );
      }

      if (category.status !== CategoryStatus.ACTIVE) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Only active categories can be assigned to a branch',
          400,
        );
      }
    }

    const assignedCount =
      await this.categoryRepo.assignCategoriesToBranch(
        command.branchId,
        uniqueIds,
      );

    return new AssignCategoriesToBranchResult(
      command.branchId,
      assignedCount,
      uniqueIds,
    );
  }
}
