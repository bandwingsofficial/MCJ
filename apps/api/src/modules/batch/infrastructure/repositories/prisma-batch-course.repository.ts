import { randomUUID } from 'crypto';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type { BatchCourseAssignmentRecord } from '../../application/batch-courses/batch-course.types';

export class PrismaBatchCourseRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByBatchId(batchId: string): Promise<BatchCourseAssignmentRecord[]> {
    const records = await this.prisma.batchCourse.findMany({
      where: {
        batchId,
        isDeleted: false,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            code: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        trainer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            status: true,
          },
        },
      },
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
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                status: true,
              },
            },
          },
        })
      : await this.prisma.batchCourse.create({
          data: {
            id: randomUUID(),
            batchId: params.batchId,
            courseId: params.courseId,
            trainerId: params.trainerId,
          },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                code: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            trainer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeCode: true,
                status: true,
              },
            },
          },
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
