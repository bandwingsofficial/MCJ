import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { BulkBatchOperationSummary } from '../shared/bulk-batch-operation.result';

export class BulkRestoreBatchesResult {
  constructor(public readonly summary: BulkBatchOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkBatchItemResult[],
  ): BulkRestoreBatchesResult {
    return new BulkRestoreBatchesResult(
      BulkBatchOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
