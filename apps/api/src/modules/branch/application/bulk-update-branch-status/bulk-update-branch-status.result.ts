import { BranchStatus } from '../../domain/enums/branch-status.enum';

import {
  BulkBranchOperationSummary,
  BulkBranchItemResult,
} from '../shared/bulk-branch-operation.result';

export class BulkUpdateBranchStatusResult extends BulkBranchOperationSummary {
  constructor(
    requestedCount: number,
    processedCount: number,
    successCount: number,
    failedCount: number,
    results: BulkBranchItemResult[],
    failures: BulkBranchItemResult[],
    public readonly status: BranchStatus,
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
    status: BranchStatus,
    requestedCount: number,
    results: BulkBranchItemResult[],
  ): BulkUpdateBranchStatusResult {
    const summary = BulkBranchOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkUpdateBranchStatusResult(
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
