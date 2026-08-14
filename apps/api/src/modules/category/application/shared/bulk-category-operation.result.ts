import { CategoryStatus } from '../../domain/enums/category-status.enum';

export interface BulkCategoryItemResult {
  categoryId: string;
  success: boolean;
  message: string;
  status?: CategoryStatus;
}

export class BulkCategoryOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkCategoryItemResult[],
    public readonly failures: BulkCategoryItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkCategoryItemResult[],
  ): BulkCategoryOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkCategoryOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
