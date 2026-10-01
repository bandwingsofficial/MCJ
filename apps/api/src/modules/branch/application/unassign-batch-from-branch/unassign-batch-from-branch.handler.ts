import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import type { BatchRepository } from '@modules/batch/domain/repositories/batch.repository';
import { resolveBatchApiStatus } from '@modules/batch/domain/utils/batch-lifecycle-status.util';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { UnassignBatchFromBranchCommand } from './unassign-batch-from-branch.command';
import { UnassignBatchFromBranchResult } from './unassign-batch-from-branch.result';

export class UnassignBatchFromBranchHandler {
  constructor(
    private readonly branchRepo: BranchRepository,
    private readonly batchRepo: BatchRepository,
  ) {}

  async execute(
    command: UnassignBatchFromBranchCommand,
  ): Promise<UnassignBatchFromBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const batch = await this.batchRepo.findById(command.batchId);

    if (!batch || batch.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch not found',
        404,
      );
    }

    const lifecycleStatus = resolveBatchApiStatus({
      storedStatus: batch.status,
      isDeleted: batch.isDeleted,
      startDate: batch.startDate,
      startTime: batch.startTime,
      endDate: batch.endDate,
      endTime: batch.endTime,
    });

    if (
      batch.status === BatchStatus.CANCELLED ||
      lifecycleStatus !== BatchStatus.UPCOMING
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only upcoming batches can be unassigned from a branch',
        400,
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
