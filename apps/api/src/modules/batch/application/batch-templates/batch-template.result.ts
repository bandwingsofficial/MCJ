import type { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import type { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import type { BatchTemplateRecord } from '../../domain/repositories/batch-template.repository';

export class BatchTemplateResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly mode: CourseMode,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly startTime: string | null,
    public readonly endTime: string | null,
    public readonly hasFixedTime: boolean,
    public readonly isActive: boolean,
    public readonly displayOrder: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromRecord(row: BatchTemplateRecord): BatchTemplateResult {
    return new BatchTemplateResult(
      row.id,
      row.name,
      row.mode,
      row.daysOfWeek,
      row.startTime,
      row.endTime,
      row.hasFixedTime,
      row.isActive,
      row.displayOrder,
      row.createdAt,
      row.updatedAt,
    );
  }
}
