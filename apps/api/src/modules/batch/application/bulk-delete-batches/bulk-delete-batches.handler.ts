import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../../domain/entities/batch.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { parseBulkBatchIds } from '../shared/parse-bulk-batch-ids';

import { BulkDeleteBatchesCommand } from './bulk-delete-batches.command';
import { BulkDeleteBatchesResult } from './bulk-delete-batches.result';

export class BulkDeleteBatchesHandler {
  private readonly logger = new Logger(BulkDeleteBatchesHandler.name);

  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    command: BulkDeleteBatchesCommand,
  ): Promise<BulkDeleteBatchesResult> {
    try {
      this.logger.log('Bulk delete batches request received');

      const batchIds = parseBulkBatchIds(command.batchIds);
      const itemResults: BulkBatchItemResult[] = [];
      const batchesToDelete: Batch[] = [];

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

        if (batch.isDeleted) {
          itemResults.push({
            batchId,
            success: true,
            message: 'Batch is already archived',
          });
          continue;
        }

        batchesToDelete.push(batch);
      }

      batchesToDelete.sort((left, right) => {
        const leftOrder = left.displayOrder ?? -1;
        const rightOrder = right.displayOrder ?? -1;
        return rightOrder - leftOrder;
      });

      for (const batch of batchesToDelete) {
        try {
          const deletedDisplayOrder = batch.displayOrder;

          batch.softDelete(command.deletedBy);
          await this.batchRepo.save(batch);

          if (deletedDisplayOrder != null) {
            await this.batchRepo.closeDisplayOrderGap(
              deletedDisplayOrder,
            );
          }

          itemResults.push({
            batchId: batch.id,
            success: true,
            message: 'Batch archived successfully',
          });

          this.logger.log(`Batch soft deleted: ${batch.id}`);
        } catch {
          itemResults.push({
            batchId: batch.id,
            success: false,
            message: 'Unable to archive batch',
          });
        }
      }

      return BulkDeleteBatchesResult.fromItemResults(
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
