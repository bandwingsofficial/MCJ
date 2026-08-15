import {
  BulkCourseOperationSummary,
  BulkCourseItemResult,
} from '../shared/bulk-course-operation.result';

export class BulkPermanentDeleteCoursesResult extends BulkCourseOperationSummary {
  static fromItemResults(
    requestedCount: number,
    results: BulkCourseItemResult[],
  ): BulkPermanentDeleteCoursesResult {
    const summary = BulkCourseOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkPermanentDeleteCoursesResult(
      summary.requestedCount,
      summary.processedCount,
      summary.successCount,
      summary.failedCount,
      summary.results,
      summary.failures,
    );
  }
}
