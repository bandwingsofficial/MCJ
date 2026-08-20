export interface BulkStudentItemResult {
  studentId: string;
  success: boolean;
  message: string;
  isActive?: boolean;
}

export class BulkStudentOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkStudentItemResult[],
    public readonly failures: BulkStudentItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkStudentItemResult[],
  ): BulkStudentOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkStudentOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
