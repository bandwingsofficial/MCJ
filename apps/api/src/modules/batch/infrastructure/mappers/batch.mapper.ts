import {
  Batch as PrismaBatch,
  BatchTrainer as PrismaBatchTrainer,
  Prisma,
} from '@prisma/client';

import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { BatchTrainer } from '../../domain/entities/batch-trainer.entity';
import { Batch } from '../../domain/entities/batch.entity';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

export type BatchWithRelations = PrismaBatch & {
  displayOrder?: number | null;

  course: {
    id: string;
    title: string;
    slug: string;
  } | null;

  branch: {
    id: string;
    branchName: string;
    branchCode: string;
  } | null;

  trainers: (PrismaBatchTrainer & {
  trainer: {
    id: string;
    firstName: string;
    lastName: string | null;
    employeeCode: string | null;
  };
})[];
};

export class BatchMapper {
  static toDomain(record: BatchWithRelations): Batch {
  return Batch.reconstitute({
    id: record.id,
    name: record.name,
    code: record.code,
    slug: record.slug,
    description: record.description,

    course: record.course
      ? {
          id: record.course.id,
          title: record.course.title,
        }
      : null,

    branch: record.branch
      ? {
          id: record.branch.id,
          branchName: record.branch.branchName,
          branchCode: record.branch.branchCode,
        }
      : null,

    courseId: record.courseId,
    branchId: record.branchId,

    startDate: record.startDate,
    endDate: record.endDate,
    startTime: record.startTime,
    endTime: record.endTime,
    daysOfWeek: record.daysOfWeek as DayOfWeek[],
    capacity: record.capacity,
    enrolledCount: record.enrolledCount,
    mode: record.mode as CourseMode,
    classroom: record.classroom,
    meetingLink: record.meetingLink,
    isFeatured: record.isFeatured,
    isActive: record.isActive,
    displayOrder: record.displayOrder,
    status: record.status as BatchStatus,

    trainers: record.trainers.map(
      (trainer) =>
        new BatchTrainer(
          trainer.id,
          trainer.batchId,
          trainer.trainerId,
          trainer.createdAt,
          trainer.updatedAt,
          trainer.trainer
            ? ({
                id: trainer.trainer.id,
                firstName: {
                  getValue: () => trainer.trainer.firstName,
                },
                lastName: {
                  getValue: () => trainer.trainer.lastName,
                },
                employeeCode: {
                  getValue: () => trainer.trainer.employeeCode,
                },
              } as any)
            : undefined,
        ),
    ),

    createdBy: record.createdBy,
    updatedBy: record.updatedBy,
    isDeleted: record.isDeleted,
    deletedAt: record.deletedAt,
    deletedBy: record.deletedBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  });
}

  static toPersistence(
    batch: Batch,
  ): Prisma.BatchUncheckedCreateInput {
    return {
      id: batch.id,
      name: batch.name.getValue(),
      code: batch.code.getValue(),
      slug: batch.slug.getValue(),
      description: batch.description,
      courseId: batch.courseId,
      branchId: batch.branchId,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      daysOfWeek: batch.daysOfWeek,
      capacity: batch.capacity.getValue(),
      enrolledCount: batch.enrolledCount,
      mode: batch.mode,
      classroom: batch.classroom.getValue(),
      meetingLink: batch.meetingLink,
      isFeatured: batch.isFeatured,
      isActive: batch.isActive,
      displayOrder: batch.displayOrder,
      status: batch.status,
      createdBy: batch.createdBy,
      updatedBy: batch.updatedBy,
      isDeleted: batch.isDeleted,
      deletedAt: batch.deletedAt,
      deletedBy: batch.deletedBy,
      createdAt: batch.createdAt,
      updatedAt: batch.updatedAt,
    } as Prisma.BatchUncheckedCreateInput;
  }
}
