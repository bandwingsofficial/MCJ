import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { BulkBatchOperationSummary } from '../shared/bulk-batch-operation.result';

export class BulkDeleteBatchesResult {
  constructor(public readonly summary: BulkBatchOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkBatchItemResult[],
  ): BulkDeleteBatchesResult {
    return new BulkDeleteBatchesResult(
      BulkBatchOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
