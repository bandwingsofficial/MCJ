import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { BulkStudentOperationSummary } from '../shared/bulk-student-operation.result';

export class BulkUpdateStudentStatusResult {
  constructor(
    public readonly isActive: boolean,
    public readonly summary: BulkStudentOperationSummary,
  ) {}

  static create(
    isActive: boolean,
    requestedCount: number,
    results: BulkStudentItemResult[],
  ): BulkUpdateStudentStatusResult {
    return new BulkUpdateStudentStatusResult(
      isActive,
      BulkStudentOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
