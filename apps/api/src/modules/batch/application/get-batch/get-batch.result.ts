import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { Batch } from '../../domain/entities/batch.entity';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export class BatchTrainerResult {
  constructor(
    public readonly id: string,
    public readonly firstName: string,
    public readonly lastName: string | null,
    public readonly employeeCode: string | null,
  ) {}
}
export class BatchCourseResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
  ) {}
}

export class BatchBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
  ) {}
}

export class GetBatchResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly code: string,
    public readonly slug: string,
    public readonly description: string | null,
    public readonly course: BatchCourseResult | null,
    public readonly branch: BatchBranchResult | null,
    public readonly courseId: string,
    public readonly branchId: string | null,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly capacity: number,
    public readonly enrolledCount: number,
    public readonly mode: CourseMode,
    public readonly classroom: string | null,
    public readonly meetingLink: string | null,
    public readonly isFeatured: boolean,
    public readonly isActive: boolean,
    public readonly displayOrder: number | null,
    public readonly status: BatchStatus,
    public readonly trainers: BatchTrainerResult[],
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromEntity(batch: Batch): GetBatchResult {
    return new GetBatchResult(
      batch.id,
      batch.name.getValue(),
      batch.code.getValue(),
      batch.slug.getValue(),
      batch.description,

      batch.course
        ? new BatchCourseResult(batch.course.id, batch.course.title)
        : null,

      batch.branch
        ? new BatchBranchResult(
            batch.branch.id,
            batch.branch.branchName,
            batch.branch.branchCode,
          )
        : null,

      batch.courseId,
      batch.branchId,
      batch.startDate,
      batch.endDate,
      batch.startTime,
      batch.endTime,
      batch.daysOfWeek,
      batch.capacity.getValue(),
      batch.enrolledCount,
      batch.mode,
      batch.classroom.getValue(),
      batch.meetingLink,
      batch.isFeatured,
      batch.isActive,
      batch.displayOrder,
      batch.status,
      batch.trainers.map(
        (trainer) =>
          new BatchTrainerResult(
            trainer.trainer?.id ?? trainer.trainerId,
            trainer.trainer?.firstName.getValue() ?? '',
            trainer.trainer?.lastName?.getValue() ?? null,
            trainer.trainer?.employeeCode?.getValue() ?? null,
          ),
      ),
      batch.createdBy,
      batch.updatedBy,
      batch.isDeleted,
      batch.deletedAt,
      batch.createdAt,
      batch.updatedAt,
    );
  }
}
