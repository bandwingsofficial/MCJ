import type { BulkStudentItemResult } from '../shared/bulk-student-operation.result';
import { BulkStudentOperationSummary } from '../shared/bulk-student-operation.result';

export class BulkPermanentDeleteStudentsResult {
  constructor(public readonly summary: BulkStudentOperationSummary) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkStudentItemResult[],
  ): BulkPermanentDeleteStudentsResult {
    return new BulkPermanentDeleteStudentsResult(
      BulkStudentOperationSummary.fromItemResults(requestedCount, results),
    );
  }
}
