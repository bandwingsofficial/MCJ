import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { BulkBatchOperationSummary } from '../shared/bulk-batch-operation.result';

export class BulkPermanentDeleteBatchesResult {
  constructor(public readonly summary: BulkBatchOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkBatchItemResult[],
  ): BulkPermanentDeleteBatchesResult {
    return new BulkPermanentDeleteBatchesResult(
      BulkBatchOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
