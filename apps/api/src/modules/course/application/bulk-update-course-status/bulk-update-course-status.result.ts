import { CourseStatus } from '../../domain/enums/course-status.enum';

import {
  BulkCourseOperationSummary,
  BulkCourseItemResult,
} from '../shared/bulk-course-operation.result';

export class BulkUpdateCourseStatusResult extends BulkCourseOperationSummary {
  constructor(
    requestedCount: number,
    processedCount: number,
    successCount: number,
    failedCount: number,
    results: BulkCourseItemResult[],
    failures: BulkCourseItemResult[],
    public readonly status: CourseStatus,
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
    status: CourseStatus,
    requestedCount: number,
    results: BulkCourseItemResult[],
  ): BulkUpdateCourseStatusResult {
    const summary = BulkCourseOperationSummary.fromItemResults(
      requestedCount,
      results,
    );

    return new BulkUpdateCourseStatusResult(
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
