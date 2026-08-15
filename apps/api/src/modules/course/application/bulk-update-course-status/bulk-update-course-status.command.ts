import { CourseStatus } from '../../domain/enums/course-status.enum';

export class BulkUpdateCourseStatusCommand {
  constructor(
    public readonly courseIds: string[],
    public readonly status: CourseStatus,
  ) {}
}
