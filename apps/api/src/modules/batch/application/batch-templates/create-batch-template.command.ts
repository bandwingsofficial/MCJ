import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export class CreateBatchTemplateCommand {
  constructor(
    public readonly name: string,
    public readonly mode: CourseMode,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly hasFixedTime: boolean,
    public readonly startTime: string | null | undefined,
    public readonly endTime: string | null | undefined,
    public readonly isActive: boolean | undefined,
    public readonly createdBy?: string,
  ) {}
}
