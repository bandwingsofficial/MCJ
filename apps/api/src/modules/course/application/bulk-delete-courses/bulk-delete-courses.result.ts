import {
  BulkCourseOperationSummary,
  BulkCourseItemResult,
} from '../shared/bulk-course-operation.result';

export class BulkDeleteCoursesResult extends BulkCourseOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCourseItemResult[],
  ): BulkDeleteCoursesResult {
    const summary = BulkCourseOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkDeleteCoursesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
