import { BranchStatus } from '../../domain/enums/branch-status.enum';

export interface BulkBranchItemResult {
  branchId: string;
  success: boolean;
  message: string;
  status?: BranchStatus;
}

export class BulkBranchOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkBranchItemResult[],
    public readonly failures: BulkBranchItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkBranchItemResult[],
  ): BulkBranchOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkBranchOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
