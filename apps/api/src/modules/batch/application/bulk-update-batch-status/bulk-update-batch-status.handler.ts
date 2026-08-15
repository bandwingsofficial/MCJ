import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Batch } from '../../domain/entities/batch.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { parseBulkBatchIds } from '../shared/parse-bulk-batch-ids';

import { BulkUpdateBatchStatusCommand } from './bulk-update-batch-status.command';
import { BulkUpdateBatchStatusResult } from './bulk-update-batch-status.result';

export class BulkUpdateBatchStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateBatchStatusHandler.name,
  );

  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    command: BulkUpdateBatchStatusCommand,
  ): Promise<BulkUpdateBatchStatusResult> {
    try {
      this.logger.log('Bulk update batch status request received');

      const batchIds = parseBulkBatchIds(command.batchIds);
      const itemResults: BulkBatchItemResult[] = [];
      const batchesToUpdate: Batch[] = [];

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
            success: false,
            message:
              'Archived batches cannot be activated or deactivated',
          });
          continue;
        }

        if (command.isActive === batch.isActive) {
          itemResults.push({
            batchId,
            success: true,
            message: `Batch is already ${command.isActive ? 'active' : 'inactive'}`,
            isActive: batch.isActive,
          });
          continue;
        }

        batchesToUpdate.push(batch);
      }

      if (!command.isActive) {
        batchesToUpdate.sort((left, right) => {
          const leftOrder = left.displayOrder ?? -1;
          const rightOrder = right.displayOrder ?? -1;
          return rightOrder - leftOrder;
        });
      }

      for (const batch of batchesToUpdate) {
        try {
          if (command.isActive) {
            const nextDisplayOrder =
              (await this.batchRepo.getMaxDisplayOrder()) + 1;

            batch.changeDisplayOrder(nextDisplayOrder);
            batch.activate(command.updatedBy);
          } else {
            if (batch.displayOrder != null) {
              await this.batchRepo.closeDisplayOrderGap(
                batch.displayOrder,
              );
            }

            batch.changeDisplayOrder(null);
            batch.deactivate(command.updatedBy);
          }

          await this.batchRepo.save(batch);

          itemResults.push({
            batchId: batch.id,
            success: true,
            message: command.isActive
              ? 'Batch activated successfully'
              : 'Batch deactivated successfully',
            isActive: batch.isActive,
          });

          this.logger.log(`Batch status updated: ${batch.id}`);
        } catch {
          itemResults.push({
            batchId: batch.id,
            success: false,
            message: 'Unable to update batch status',
          });
        }
      }

      return BulkUpdateBatchStatusResult.create(
        command.isActive,
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
