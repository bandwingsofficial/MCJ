import { randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { BatchCourseAssignmentRecord } from '../../application/batch-courses/batch-course.types';

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
    select: courseAssignmentSelect,
  },
  trainer: {
    select: trainerAssignmentSelect,
  },
} as const;

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

    return records as BatchCourseAssignmentRecord[];
  }

  async assign(params: {
    batchId: string;
    courseId: string;
    trainerId: string;
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
            trainerId: params.trainerId,
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
            trainerId: params.trainerId,
          },
          include: assignmentInclude,
        });

    return record as BatchCourseAssignmentRecord;
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
