import { randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type {
  BatchCourseAssignmentRecord,
  BatchCourseTrainerRecord,
} from '../../application/batch-courses/batch-course.types';

const courseAssignmentSelect = {
  id: true,
  title: true,
  code: true,
  tagline: true,
  shortDescription: true,
  description: true,
  thumbnailUrl: true,
  minimumQualifications: true,
  isFree: true,
  currency: true,
  discountedPrice: true,
  originalPrice: true,
  category: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

const trainerAssignmentSelect = {
  id: true,
  firstName: true,
  lastName: true,
  employeeCode: true,
  status: true,
  profileImageUrl: true,
  specialization: true,
  email: true,
  qualification: true,
} as const;

const assignmentInclude = {
  course: {
    select: {
      ...courseAssignmentSelect,
      trainers: {
        where: {
          trainer: {
            isDeleted: false,
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          trainer: {
            select: trainerAssignmentSelect,
          },
        },
      },
    },
  },
} as const;

type AssignmentQueryRecord = {
  id: string;
  batchId: string;
  courseId: string;
  trainerId: string | null;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  course: {
    id: string;
    title: string;
    code: string;
    tagline: string | null;
    shortDescription: string | null;
    description: string | null;
    thumbnailUrl: string | null;
    minimumQualifications: string[];
    isFree: boolean;
    currency: string;
    discountedPrice: unknown;
    originalPrice: unknown;
    category: {
      id: string;
      name: string;
    } | null;
    trainers: Array<{
      trainer: BatchCourseTrainerRecord | null;
    }>;
  };
};

function toAssignmentRecord(
  record: AssignmentQueryRecord,
): BatchCourseAssignmentRecord {
  const { trainers: trainerLinks, ...course } = record.course;
  const trainers = trainerLinks
    .map((link) => link.trainer)
    .filter((trainer): trainer is BatchCourseTrainerRecord => trainer != null);

  return {
    id: record.id,
    batchId: record.batchId,
    courseId: record.courseId,
    trainerId: record.trainerId,
    isActive: record.isActive,
    isDeleted: record.isDeleted,
    deletedAt: record.deletedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    course,
    trainers,
    trainer: trainers[0] ?? null,
  };
}

export class PrismaBatchCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBatchId(batchId: string): Promise<BatchCourseAssignmentRecord[]> {
    const records = await this.prisma.batchCourse.findMany({
      where: {
        batchId,
        isDeleted: false,
      },
      include: assignmentInclude,
      orderBy: {
        createdAt: 'asc',
      },
    });

    return records.map((record) =>
      toAssignmentRecord(record as AssignmentQueryRecord),
    );
  }

  async assign(params: {
    batchId: string;
    courseId: string;
  }): Promise<BatchCourseAssignmentRecord> {
    const existing = await this.prisma.batchCourse.findUnique({
      where: {
        batchId_courseId: {
          batchId: params.batchId,
          courseId: params.courseId,
        },
      },
    });

    if (existing && !existing.isDeleted) {
      throw new Error('Course is already assigned to this batch');
    }

    const record = existing
      ? await this.prisma.batchCourse.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            isDeleted: false,
            deletedAt: null,
          },
          include: assignmentInclude,
        })
      : await this.prisma.batchCourse.create({
          data: {
            id: randomUUID(),
            batchId: params.batchId,
            courseId: params.courseId,
          },
          include: assignmentInclude,
        });

    return toAssignmentRecord(record as AssignmentQueryRecord);
  }

  async remove(assignmentId: string, batchId: string): Promise<void> {
    await this.prisma.batchCourse.updateMany({
      where: {
        id: assignmentId,
        batchId,
        isDeleted: false,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
