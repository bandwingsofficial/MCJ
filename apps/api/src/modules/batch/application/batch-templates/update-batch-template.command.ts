import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export class UpdateBatchTemplateCommand {
  constructor(
    public readonly id: string,
    public readonly name: string | undefined,
    public readonly mode: CourseMode | undefined,
    public readonly daysOfWeek: DayOfWeek[] | undefined,
    public readonly hasFixedTime: boolean | undefined,
    public readonly startTime: string | null | undefined,
    public readonly endTime: string | null | undefined,
    public readonly isActive: boolean | undefined,
    public readonly updatedBy?: string,
  ) {}
}
