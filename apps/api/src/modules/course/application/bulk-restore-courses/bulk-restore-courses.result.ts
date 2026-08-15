import {
  BulkCourseOperationSummary,
  BulkCourseItemResult,
} from '../shared/bulk-course-operation.result';

export class BulkRestoreCoursesResult extends BulkCourseOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCourseItemResult[],
  ): BulkRestoreCoursesResult {
    const summary = BulkCourseOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkRestoreCoursesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
