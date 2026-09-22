import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { UnassignBatchFromBranchCommand } from './unassign-batch-from-branch.command';
import { UnassignBatchFromBranchResult } from './unassign-batch-from-branch.result';

export class UnassignBatchFromBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: UnassignBatchFromBranchCommand,
  ): Promise<UnassignBatchFromBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const [batch] = await this.branchRepo.findBatchesByIds([
      command.batchId,
    ]);

    if (!batch) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch not found',
        404,
      );
    }

    await this.branchRepo.unassignBatchFromBranch(
      command.branchId,
      command.batchId,
    );

    await this.branchRepo.syncCourseLinksAfterBatchUnassign(
      command.branchId,
      command.batchId,
    );

    return new UnassignBatchFromBranchResult(
      command.branchId,
      command.batchId,
      true,
    );
  }
}
