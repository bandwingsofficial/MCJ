import { CourseStatus } from '../../domain/enums/course-status.enum';

export interface BulkCourseItemResult {
  courseId: string;
  success: boolean;
  message: string;
  status?: CourseStatus;
}

export class BulkCourseOperationSummary {
  constructor(
    public readonly requestedCount: number,
    public readonly processedCount: number,
    public readonly successCount: number,
    public readonly failedCount: number,
    public readonly results: BulkCourseItemResult[],
    public readonly failures: BulkCourseItemResult[],
  ) {}

  static fromItemResults(
    requestedCount: number,
    results: BulkCourseItemResult[],
  ): BulkCourseOperationSummary {
    const failures = results.filter((item) => !item.success);

    return new BulkCourseOperationSummary(
      requestedCount,
      results.length,
      results.length - failures.length,
      failures.length,
      results,
      failures,
    );
  }
}
