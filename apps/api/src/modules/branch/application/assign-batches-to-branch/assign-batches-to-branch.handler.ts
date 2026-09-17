import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { AssignBatchesToBranchCommand } from './assign-batches-to-branch.command';
import { AssignBatchesToBranchResult } from './assign-batches-to-branch.result';

export class AssignBatchesToBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: AssignBatchesToBranchCommand,
  ): Promise<AssignBatchesToBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const uniqueIds = [...new Set(command.batchIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Select at least one batch to assign',
        400,
      );
    }

    const batches = await this.branchRepo.findBatchesByIds(uniqueIds);
    const batchesById = new Map(batches.map((batch) => [batch.id, batch]));

    for (const batchId of uniqueIds) {
      const batch = batchesById.get(batchId);

      if (!batch || batch.isDeleted) {
        throw new BaseException(
          ERROR_CODES.BATCH_NOT_FOUND,
          'Batch not found',
          404,
        );
      }
    }

    const assignedCount = await this.branchRepo.assignBatchesToBranch(
      command.branchId,
      uniqueIds,
    );

    return new AssignBatchesToBranchResult(
      command.branchId,
      assignedCount,
      uniqueIds,
    );
  }
}
