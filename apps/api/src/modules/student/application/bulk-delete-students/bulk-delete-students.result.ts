import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { BulkStudentOperationSummary } from '../shared/bulk-student-operation.result';

export class BulkDeleteStudentsResult {
  constructor(public readonly summary: BulkStudentOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkStudentItemResult[],
  ): BulkDeleteStudentsResult {
    return new BulkDeleteStudentsResult(
      BulkStudentOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
