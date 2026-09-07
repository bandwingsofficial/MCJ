import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import {
  Batch,
  type BatchTimingRef,
} from '../../domain/entities/batch.entity';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';
import { resolveBatchApiStatus } from '../../domain/utils/batch-lifecycle-status.util';

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
    public readonly code: string | null = null,
    public readonly category: { id: string; name: string } | null = null,
  ) {}
}

export class BatchBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
  ) {}
}

export class BatchCategoryResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

/** Batch timing master (template) this batch was created from. */
export class BatchTemplateRefResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly mode: CourseMode,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly startTime: string | null,
    public readonly endTime: string | null,
    public readonly hasFixedTime: boolean,
    public readonly isActive: boolean,
    public readonly isDeleted: boolean,
  ) {}
}

/** A child timing owned by this batch (batchId is the parent). */
export class BatchTimingResult {
  constructor(
    public readonly id: string,
    public readonly batchId: string,
    public readonly batchTemplateId: string | null,
    public readonly name: string,
    public readonly mode: CourseMode,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly capacity: number,
    public readonly enrolledCount: number,
    public readonly studentsCount: number,
    public readonly status: BatchStatus,
    public readonly isActive: boolean,
    public readonly displayOrder: number | null,
    public readonly isDeleted: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static fromRef(timing: BatchTimingRef): BatchTimingResult {
    return new BatchTimingResult(
      timing.id,
      timing.batchId,
      timing.batchTemplateId,
      timing.name,
      timing.mode,
      timing.daysOfWeek,
      timing.startDate,
      timing.endDate,
      timing.startTime,
      timing.endTime,
      timing.capacity,
      timing.enrolledCount,
      timing.enrolledCount,
      resolveBatchApiStatus({
        storedStatus: timing.status,
        isDeleted: timing.isDeleted,
        startDate: timing.startDate,
        startTime: timing.startTime,
        endDate: timing.endDate,
        endTime: timing.endTime,
      }),
      timing.isActive,
      timing.displayOrder,
      timing.isDeleted,
      timing.createdAt,
      timing.updatedAt,
    );
  }
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
    public readonly category: BatchCategoryResult | null,
    public readonly courseId: string | null,
    public readonly categoryId: string | null,
    public readonly branchId: string | null,
    public readonly batchTemplateId: string | null,
    public readonly batchTemplate: BatchTemplateRefResult | null,
    public readonly timings: BatchTimingResult[],
    public readonly timingsCount: number,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly startTime: string,
    public readonly endTime: string,
    public readonly daysOfWeek: DayOfWeek[],
    public readonly capacity: number,
    public readonly enrolledCount: number,
    public readonly mode: CourseMode,
    public readonly durationValue: number | null,
    public readonly durationType: string | null,
    public readonly originalPrice: number,
    public readonly discountAmount: number,
    public readonly discountedPrice: number,
    public readonly discountPercent: number,
    public readonly currency: string,
    public readonly isFree: boolean,
    public readonly modePricing: Record<string, unknown> | null,
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
    const pricing = batch.getPricing();
    const status = resolveBatchApiStatus({
      storedStatus: batch.status,
      isDeleted: batch.isDeleted,
      startDate: batch.startDate,
      startTime: batch.startTime,
      endDate: batch.endDate,
      endTime: batch.endTime,
    });
    const timings = (batch.timings ?? []).map(BatchTimingResult.fromRef);
    const modePricing =
      ((batch as Batch & { modePricing?: unknown }).modePricing as
        | Record<string, unknown>
        | null
        | undefined) ?? null;

    return new GetBatchResult(
      batch.id,
      batch.name.getValue(),
      batch.code.getValue(),
      batch.slug.getValue(),
      batch.description,

      batch.course
        ? new BatchCourseResult(
            batch.course.id,
            batch.course.title,
            batch.course.code ?? null,
            batch.course.category ?? null,
          )
        : null,

      batch.branch
        ? new BatchBranchResult(
            batch.branch.id,
            batch.branch.branchName,
            batch.branch.branchCode,
          )
        : null,

      batch.category
        ? new BatchCategoryResult(batch.category.id, batch.category.name)
        : null,

      batch.courseId,
      batch.categoryId,
      batch.branchId,
      batch.batchTemplateId,

      batch.batchTemplate
        ? new BatchTemplateRefResult(
            batch.batchTemplate.id,
            batch.batchTemplate.name,
            batch.batchTemplate.mode,
            batch.batchTemplate.daysOfWeek,
            batch.batchTemplate.startTime,
            batch.batchTemplate.endTime,
            batch.batchTemplate.hasFixedTime,
            batch.batchTemplate.isActive,
            batch.batchTemplate.isDeleted,
          )
        : null,

      timings,
      timings.length,

      batch.startDate,
      batch.endDate,
      batch.startTime,
      batch.endTime,
      batch.daysOfWeek,
      batch.capacity.getValue(),
      batch.enrolledCount,
      batch.mode,
      batch.durationValue,
      batch.durationType,
      pricing.originalPrice,
      pricing.discountAmount,
      pricing.discountedPrice,
      pricing.discountPercent,
      pricing.currency,
      pricing.isFree,
      modePricing,
      batch.classroom.getValue(),
      batch.meetingLink,
      batch.isFeatured,
      batch.isActive,
      batch.displayOrder,
      status,
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
