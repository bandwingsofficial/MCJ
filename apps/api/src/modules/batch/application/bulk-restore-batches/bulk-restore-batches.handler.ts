import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../../domain/entities/batch.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { parseBulkBatchIds } from '../shared/parse-bulk-batch-ids';

import { BulkRestoreBatchesCommand } from './bulk-restore-batches.command';
import { BulkRestoreBatchesResult } from './bulk-restore-batches.result';

export class BulkRestoreBatchesHandler {
  private readonly logger = new Logger(BulkRestoreBatchesHandler.name);

  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    command: BulkRestoreBatchesCommand,
  ): Promise<BulkRestoreBatchesResult> {
    try {
      this.logger.log('Bulk restore batches request received');

      const batchIds = parseBulkBatchIds(command.batchIds);
      const itemResults: BulkBatchItemResult[] = [];
      const batchesToRestore: Batch[] = [];

      for (const batchId of batchIds) {
        const batch =
          await this.batchRepo.findByIdIncludingDeleted(batchId);

        if (!batch) {
          itemResults.push({
            batchId,
            success: false,
            message: 'Batch not found',
          });
          continue;
        }

        if (!batch.isDeleted) {
          itemResults.push({
            batchId,
            success: true,
            message: 'Batch is not archived',
          });
          continue;
        }

        batchesToRestore.push(batch);
      }

      for (const batch of batchesToRestore) {
        try {
          batch.restore(command.updatedBy);

          if (batch.isActive) {
            batch.changeDisplayOrder(
              (await this.batchRepo.getMaxDisplayOrder()) + 1,
            );
          }

          await this.batchRepo.save(batch);

          itemResults.push({
            batchId: batch.id,
            success: true,
            message: 'Batch restored successfully',
          });

          this.logger.log(`Batch restored: ${batch.id}`);
        } catch {
          itemResults.push({
            batchId: batch.id,
            success: false,
            message: 'Unable to restore batch',
          });
        }
      }

      return BulkRestoreBatchesResult.fromItemResults(
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
}
