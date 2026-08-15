export interface BulkBatchItemResult {
  batchId: string;
  success: boolean;
  message: string;
  isActive?: boolean;
}

export class BulkBatchOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkBatchItemResult[],
    public readonly failures: BulkBatchItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkBatchItemResult[],
  ): BulkBatchOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkBatchOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
