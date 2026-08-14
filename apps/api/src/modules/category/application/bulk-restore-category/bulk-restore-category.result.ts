import {
  BulkCategoryItemResult,
  BulkCategoryOperationSummary,
} from '../shared/bulk-category-operation.result';

export class BulkRestoreCategoriesResult extends BulkCategoryOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCategoryItemResult[],
  ): BulkRestoreCategoriesResult {
    const summary = BulkCategoryOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkRestoreCategoriesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
