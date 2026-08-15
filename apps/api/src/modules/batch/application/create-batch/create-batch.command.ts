import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export class CreateBatchCommand {
  constructor(
    public readonly name: string,
    public readonly courseId: string,
    public readonly startDate: Date,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly capacity: number,
    public readonly code?: string,
    public readonly slug?: string,
    public readonly description?: string,
    public readonly branchId?: string,
    public readonly endDate?: Date,
    public readonly startTime?: string,
    public readonly endTime?: string,
    public readonly enrolledCount?: number,
    public readonly mode?: CourseMode,
    public readonly classroom?: string,
    public readonly meetingLink?: string,
    public readonly isFeatured?: boolean,
    public readonly status?: BatchStatus,
    public readonly isActive?: boolean,
    public readonly trainerIds: string[] = [],
    public readonly createdBy?: string,
  ) {}
}
