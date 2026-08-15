import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { BatchRepository } from '../../domain/repositories/batch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { parseBulkBatchIds } from '../shared/parse-bulk-batch-ids';

import { BulkPermanentDeleteBatchesCommand } from './bulk-permanent-delete-batches.command';
import { BulkPermanentDeleteBatchesResult } from './bulk-permanent-delete-batches.result';

export class BulkPermanentDeleteBatchesHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteBatchesHandler.name,
  );

  constructor(private readonly batchRepo: BatchRepository) {}

  async execute(
    command: BulkPermanentDeleteBatchesCommand,
  ): Promise<BulkPermanentDeleteBatchesResult> {
    try {
      this.logger.log(
        'Bulk permanent delete batches request received',
      );

      const batchIds = parseBulkBatchIds(command.batchIds);
      const itemResults: BulkBatchItemResult[] = [];

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
            success: false,
            message: 'Only archived batches can be permanently deleted',
          });
          continue;
        }

        try {
          await this.batchRepo.deletePermanent(batch.id);

          itemResults.push({
            batchId: batch.id,
            success: true,
            message: 'Batch permanently deleted successfully',
          });

          this.logger.log(`Batch permanently deleted: ${batch.id}`);
        } catch {
          itemResults.push({
            batchId: batch.id,
            success: false,
            message: 'Unable to permanently delete batch',
          });
        }
      }

      return BulkPermanentDeleteBatchesResult.fromItemResults(
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
