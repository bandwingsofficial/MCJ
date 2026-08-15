import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { BulkBatchOperationSummary } from '../shared/bulk-batch-operation.result';

export class BulkUpdateBatchStatusResult {
  constructor(
    public readonly isActive: boolean,
    public readonly summary: BulkBatchOperationSummary,
  ) {}

  static create(
    isActive: boolean,
    requestedCount: number,
    results: BulkBatchItemResult[],
  ): BulkUpdateBatchStatusResult {
    return new BulkUpdateBatchStatusResult(
      isActive,
      BulkBatchOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
