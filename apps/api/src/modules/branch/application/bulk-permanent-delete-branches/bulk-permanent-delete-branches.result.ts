import {
  BulkBranchOperationSummary,
  BulkBranchItemResult,
} from '../shared/bulk-branch-operation.result';

export class BulkPermanentDeleteBranchesResult extends BulkBranchOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkBranchItemResult[],
  ): BulkPermanentDeleteBranchesResult {
    const summary = BulkBranchOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkPermanentDeleteBranchesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
