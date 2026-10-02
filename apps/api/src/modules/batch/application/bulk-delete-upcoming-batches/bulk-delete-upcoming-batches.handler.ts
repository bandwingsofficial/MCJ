import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { BatchRepository } from '../../domain/repositories/batch.repository';
import type { Batch } from '../../domain/entities/batch.entity';
import {
  ensureBatchCanDeleteUpcoming,
  isBatchEligibleForUpcomingDelete,
} from '../../domain/utils/batch-selection.util';
import { ValidationError } from '../errors/validation.error';
import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { parseBulkBatchIds } from '../shared/parse-bulk-batch-ids';

import { BulkDeleteUpcomingBatchesCommand } from './bulk-delete-upcoming-batches.command';
import { BulkDeleteUpcomingBatchesResult } from './bulk-delete-upcoming-batches.result';

export class BulkDeleteUpcomingBatchesHandler {
  private readonly logger = new Logger(BulkDeleteUpcomingBatchesHandler.name);

  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    command: BulkDeleteUpcomingBatchesCommand,
  ): Promise<BulkDeleteUpcomingBatchesResult> {
    try {
      const batchIds = parseBulkBatchIds(command.batchIds);
      const assignments =
        await this.batchRepo.findBranchAssignmentsByBatchIds(batchIds);

      const loaded: Array<{ batchId: string; batch: Batch | null }> = [];

      for (const batchId of batchIds) {
        loaded.push({
          batchId,
          batch: await this.batchRepo.findById(batchId),
        });
      }

      const preflightError = this.validateBulkDeletePreflight(
        loaded,
        assignments,
      );

      if (preflightError) {
        return BulkDeleteUpcomingBatchesResult.fromItemResults(
          batchIds.length,
          batchIds.map((batchId) => ({
            batchId,
            success: false,
            message: preflightError,
          })),
        );
      }

      const itemResults: BulkBatchItemResult[] = [];

      for (const entry of loaded) {
        const batch = entry.batch!;

        try {
          await this.batchRepo.deletePermanent(batch.id);

          itemResults.push({
            batchId: batch.id,
            success: true,
            message: 'Batch deleted successfully',
          });

          this.logger.log(`Upcoming batch deleted: ${batch.id}`);
        } catch (error) {
          const message =
            error instanceof Error && error.message.trim()
              ? error.message
              : 'Unable to delete batch';

          itemResults.push({
            batchId: batch.id,
            success: false,
            message,
          });
        }
      }

      return BulkDeleteUpcomingBatchesResult.fromItemResults(
        batchIds.length,
        itemResults,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }

  private validateBulkDeletePreflight(
    loaded: Array<{ batchId: string; batch: Batch | null }>,
    assignments: Record<string, { branchId: string; branchName: string }[]>,
  ): string | null {
    for (const entry of loaded) {
      if (!entry.batch) {
        return 'One or more selected batches were not found.';
      }

      if (!isBatchEligibleForUpcomingDelete(entry.batch)) {
        return 'Bulk delete is allowed only for upcoming batches.';
      }

      const branchNames =
        assignments[entry.batch.id]?.map((item) => item.branchName) ?? [];

      try {
        ensureBatchCanDeleteUpcoming(entry.batch, branchNames);
      } catch (error) {
        return error instanceof Error && error.message.trim()
          ? error.message
          : 'One or more selected batches cannot be deleted.';
      }
    }

    return null;
  }
}
