import {
  BulkCategoryItemResult,
  BulkCategoryOperationSummary,
} from '../shared/bulk-category-operation.result';

export class BulkPermanentDeleteCategoriesResult extends BulkCategoryOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCategoryItemResult[],
  ): BulkPermanentDeleteCategoriesResult {
    const summary = BulkCategoryOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkPermanentDeleteCategoriesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
