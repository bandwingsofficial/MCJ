import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { BulkStudentOperationSummary } from '../shared/bulk-student-operation.result';

export class BulkRestoreStudentsResult {
  constructor(public readonly summary: BulkStudentOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkStudentItemResult[],
  ): BulkRestoreStudentsResult {
    return new BulkRestoreStudentsResult(
      BulkStudentOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
