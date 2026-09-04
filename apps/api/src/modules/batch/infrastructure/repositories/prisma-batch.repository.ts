import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import {
  BATCH_CODE_SCAN_PREFIX,
  parseBatchCodeSequence,
} from '../../domain/utils/batch-code.util';

import { Batch } from '../../domain/entities/batch.entity';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import {
  BatchListFilters,
  BatchRepository,
} from '../../domain/repositories/batch.repository';
import {
  calculateBatchLifecycleStatus,
  isBatchLifecycleStatus,
} from '../../domain/utils/batch-lifecycle-status.util';
import { BatchMapper } from '../mappers/batch.mapper';

export class PrismaBatchRepository implements BatchRepository {
  private readonly logger = new Logger(PrismaBatchRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async save(batch: Batch): Promise<void> {
    this.logger.log(`💾 Saving batch: ${batch.id}`);

    const data = BatchMapper.toPersistence(batch);

    await this.prisma.$transaction(async (tx) => {
      await tx.batch.upsert({
        where: { id: batch.id },
        update: { ...data },
        create: { ...data },
      });

      await tx.batchTrainer.deleteMany({
        where: { batchId: batch.id },
      });

      if (batch.trainers.length) {
        await tx.batchTrainer.createMany({
          data: batch.trainers.map((trainer) => ({
            id: trainer.id,
            batchId: trainer.batchId,
            trainerId: trainer.trainerId,
            createdAt: trainer.createdAt,
            updatedAt: trainer.updatedAt,
          })),
          skipDuplicates: true,
        });
      }
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Batch | null> {
    const record = await this.prisma.batch.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? BatchMapper.toDomain(record) : null;
  }

  async findByIdIncludingDeleted(id: string): Promise<Batch | null> {
    return this.findById(id, true);
  }

  async findByCode(
    code: string,
    includeDeleted = false,
  ): Promise<Batch | null> {
    const record = await this.prisma.batch.findFirst({
      where: {
        code,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? BatchMapper.toDomain(record) : null;
  }

  async findBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<Batch | null> {
    const record = await this.prisma.batch.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: this.includeRelations(),
    });

    return record ? BatchMapper.toDomain(record) : null;
  }

  async findAll(
    filters: BatchListFilters = {},
  ): Promise<Batch[]> {
    if (isBatchLifecycleStatus(filters.status)) {
      return this.findAllByLifecycleStatus(filters);
    }

    const records = await this.prisma.batch.findMany({
      where: this.buildWhere(filters),
      include: this.includeRelations(),
      orderBy: [
        { displayOrder: { sort: 'asc', nulls: 'last' } },
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ] as Prisma.BatchOrderByWithRelationInput[],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(BatchMapper.toDomain);
  }

  async count(filters: BatchListFilters = {}): Promise<number> {
    if (isBatchLifecycleStatus(filters.status)) {
      const matched = await this.findLifecycleMatchedRecords(filters);
      return matched.length;
    }

    return this.prisma.batch.count({
      where: this.buildWhere(filters),
    });
  }

  private async findAllByLifecycleStatus(
    filters: BatchListFilters,
  ): Promise<Batch[]> {
    const matched = await this.findLifecycleMatchedRecords(filters);
    const skip = filters.skip ?? 0;
    const take = filters.take;

    const page =
      take === undefined
        ? matched.slice(skip)
        : matched.slice(skip, skip + take);

    return page.map(BatchMapper.toDomain);
  }

  private async findLifecycleMatchedRecords(
    filters: BatchListFilters,
  ) {
    const lifecycleStatus = filters.status as BatchStatus;
    const where = this.buildWhere({
      ...filters,
      status: undefined,
    });

    // Lifecycle tabs only include date-driven batches (not cancelled/archived).
    where.status = {
      notIn: [BatchStatus.CANCELLED, BatchStatus.ARCHIVED],
    };

    const records = await this.prisma.batch.findMany({
      where,
      include: this.includeRelations(),
      orderBy: [
        { displayOrder: { sort: 'asc', nulls: 'last' } },
        { startDate: 'asc' },
        { createdAt: 'desc' },
      ] as Prisma.BatchOrderByWithRelationInput[],
    });

    const now = new Date();

    return records.filter((record) => {
      const calculated = calculateBatchLifecycleStatus({
        startDate: record.startDate,
        startTime: record.startTime,
        endDate: record.endDate,
        endTime: record.endTime,
        now,
      });

      return calculated === lifecycleStatus;
    });
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.batch.aggregate({
      where: {
        isDeleted: false,
        isActive: true,
        displayOrder: { not: null },
      } as Prisma.BatchWhereInput,
      _max: {
        displayOrder: true,
      } as Prisma.BatchMaxAggregateInputType,
    });

    const maxOrder = (result._max as { displayOrder?: number | null })
      .displayOrder;

    return maxOrder ?? 0;
  }

  async getMaxBatchCodeSequence(): Promise<number> {
    const records = await this.prisma.batch.findMany({
      where: {
        code: {
          startsWith: BATCH_CODE_SCAN_PREFIX,
        },
      },
      select: {
        code: true,
      },
    });

    let max = 0;

    for (const record of records) {
      const value = parseBatchCodeSequence(record.code);

      if (value !== null && value > max) {
        max = value;
      }
    }

    return max;
  }

  async closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.batch.updateMany({
      where: {
        isDeleted: false,
        displayOrder: {
          gt: deletedDisplayOrder,
        },
      } as Prisma.BatchWhereInput,
      data: {
        displayOrder: {
          decrement: 1,
        },
      } as Prisma.BatchUpdateManyMutationInput,
    });
  }

  async moveDisplayOrder(
    batchId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.batch.updateMany({
          where: {
            isDeleted: false,
            displayOrder: {
              gte: newOrder,
              lt: oldOrder,
            },
          } as Prisma.BatchWhereInput,
          data: {
            displayOrder: {
              increment: 1,
            },
          } as Prisma.BatchUpdateManyMutationInput,
        });
      } else {
        await tx.batch.updateMany({
          where: {
            isDeleted: false,
            displayOrder: {
              gt: oldOrder,
              lte: newOrder,
            },
          } as Prisma.BatchWhereInput,
          data: {
            displayOrder: {
              decrement: 1,
            },
          } as Prisma.BatchUpdateManyMutationInput,
        });
      }

      await tx.batch.update({
        where: { id: batchId },
        data: { displayOrder: newOrder } as Prisma.BatchUpdateInput,
      });
    });
  }

  async getSummaryCounts(batchId: string): Promise<{
    studentsCount: number;
    trainerCount: number;
    enrolledCount: number;
    capacity: number;
    attendancePresent: number;
    attendanceAbsent: number;
  }> {
    const batch = await this.prisma.batch.findUnique({
      where: { id: batchId },
      select: {
        enrolledCount: true,
        capacity: true,
      },
    });

    const [studentsCount, trainerCount] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          batchId,
          isDeleted: false,
        },
      }),
      this.prisma.batchCourse.findMany({
        where: {
          batchId,
          isDeleted: false,
          isActive: true,
        },
        select: {
          trainerId: true,
        },
        distinct: ['trainerId'],
      }).then((rows) => rows.length),
    ]);

    return {
      studentsCount,
      trainerCount,
      enrolledCount: studentsCount,
      capacity: batch?.capacity ?? 0,
      attendancePresent: 0,
      attendanceAbsent: 0,
    };
  }

  async findFirstAssignedCourseId(batchId: string): Promise<string | null> {
    const assignment = await this.prisma.batchCourse.findFirst({
      where: {
        batchId,
        isDeleted: false,
        isActive: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: {
        courseId: true,
      },
    });

    return assignment?.courseId ?? null;
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.batch.delete({
      where: { id },
    });
  }

  private includeRelations() {
    return {
      course: {
        select: {
          id: true,
          title: true,
          code: true,
          slug: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },

      batchCourses: {
        where: {
          isDeleted: false,
        },
        orderBy: {
          createdAt: 'asc' as const,
        },
        select: {
          course: {
            select: {
              id: true,
              title: true,
              code: true,
              slug: true,
              category: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },

      branch: {
        select: {
          id: true,
          branchName: true,
          branchCode: true,
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      trainers: {
        orderBy: { createdAt: 'desc' as const },
        include: {
          trainer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
      },
    };
  }

  private buildWhere(
    filters: BatchListFilters,
  ): Prisma.BatchWhereInput {
    const where: Prisma.BatchWhereInput = {};

    if (filters.isDeleted === true) {
      where.isDeleted = true;
    } else if (filters.isDeleted === false) {
      where.isDeleted = false;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.isActive = true;
    } else if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.courseId) where.courseId = filters.courseId;
    if (filters.branchId) where.branchId = filters.branchId;
    if (filters.mode) where.mode = filters.mode;
    if (filters.categoryId) {
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        {
          OR: [
            { categoryId: filters.categoryId },
            { course: { categoryId: filters.categoryId } },
            {
              batchCourses: {
                some: {
                  isDeleted: false,
                  course: { categoryId: filters.categoryId },
                },
              },
            },
          ],
        },
      ];
    }
    if (filters.isFeatured !== undefined) where.isFeatured = filters.isFeatured;

    if (filters.trainerId) {
      where.trainers = {
        some: {
          trainerId: filters.trainerId,
        },
      };
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { code: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
