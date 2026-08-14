import {
  BulkCategoryItemResult,
  BulkCategoryOperationSummary,
} from '../shared/bulk-category-operation.result';

export class BulkDeleteCategoriesResult extends BulkCategoryOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCategoryItemResult[],
  ): BulkDeleteCategoriesResult {
    const summary = BulkCategoryOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkDeleteCategoriesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
