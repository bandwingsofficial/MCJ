import { CategoryStatus } from '../../domain/enums/category-status.enum';

import {
  BulkCategoryItemResult,
  BulkCategoryOperationSummary,
} from '../shared/bulk-category-operation.result';

export class BulkUpdateCategoryStatusResult extends BulkCategoryOperationSummary {
  constructor(
    requestedCount: number,
    processedCount: number,
    successCount: number,
    failedCount: number,
    results: BulkCategoryItemResult[],
    failures: BulkCategoryItemResult[],
    public readonly status: CategoryStatus,
  ) {
    super(
      requestedCount,
      processedCount,
      successCount,
      failedCount,
      results,
      failures,
    );
  }

  static create(
    status: CategoryStatus,
    requestedCount: number,
    results: BulkCategoryItemResult[],
  ): BulkUpdateCategoryStatusResult {
    const summary = BulkCategoryOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkUpdateCategoryStatusResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
      status,
    );
  }
}
