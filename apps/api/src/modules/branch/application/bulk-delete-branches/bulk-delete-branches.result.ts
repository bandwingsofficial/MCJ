import {
  BulkBranchOperationSummary,
  BulkBranchItemResult,
} from '../shared/bulk-branch-operation.result';

export class BulkDeleteBranchesResult extends BulkBranchOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkBranchItemResult[],
  ): BulkDeleteBranchesResult {
    const summary = BulkBranchOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkDeleteBranchesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
