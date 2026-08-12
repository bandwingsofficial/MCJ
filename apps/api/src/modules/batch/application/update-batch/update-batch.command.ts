import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export class UpdateBatchCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly code?: string,
    public readonly slug?: string,
    public readonly description?: string | null,
    public readonly courseId?: string,
    public readonly branchId?: string | null,
    public readonly startDate?: Date,
    public readonly endDate?: Date | null,
    public readonly startTime?: string,
    public readonly endTime?: string,
    public readonly daysOfWeek?: DayOfWeek[],
    public readonly capacity?: number,
    public readonly enrolledCount?: number,
    public readonly mode?: CourseMode,
    public readonly classroom?: string | null,
    public readonly meetingLink?: string | null,
    public readonly isFeatured?: boolean,
    public readonly status?: BatchStatus,
    public readonly updatedBy?: string,
  ) {}
}