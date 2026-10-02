import type { BulkBatchItemResult } from '../shared/bulk-batch-operation.result';
import { BulkBatchOperationSummary } from '../shared/bulk-batch-operation.result';

export class BulkDeleteUpcomingBatchesResult {
  constructor(public readonly summary: BulkBatchOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    itemResults: BulkBatchItemResult[],
  ): BulkDeleteUpcomingBatchesResult {
    return new BulkDeleteUpcomingBatchesResult(
      BulkBatchOperationSummary.fromItemResults(requestedCount, itemResults),
    );
  }
}
