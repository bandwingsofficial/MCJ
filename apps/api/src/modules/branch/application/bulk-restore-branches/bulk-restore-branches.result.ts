import {
  BulkBranchOperationSummary,
  BulkBranchItemResult,
} from '../shared/bulk-branch-operation.result';

export class BulkRestoreBranchesResult extends BulkBranchOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkBranchItemResult[],
  ): BulkRestoreBranchesResult {
    const summary = BulkBranchOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkRestoreBranchesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
