// src/modules/branch/infrastructure/repositories/prisma-branch.repository.ts

import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '@/infrastructure/prisma/prisma.service';

import type {
  BranchListFilters,
  BranchRepository,
} from '../../domain/repositories/branch.repository';

import { Branch } from '../../domain/entities/branch.entity';

import { BranchMapper } from '../mappers/branch.mapper';

import { BranchStatus } from '../../domain/enums/branch-status.enum';
import {
  linkCoursesForAssignedBatches,
  syncCourseLinksAfterBatchUnassign,
} from '../../application/services/branch-batch-course-link.service';

export class PrismaBranchRepository
  implements BranchRepository
{
  private readonly logger = new Logger(
    PrismaBranchRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // 💾 SAVE
  // =====================

  async save(branch: Branch): Promise<void> {
    this.logger.log(
      `💾 Saving branch: ${branch.id}`,
    );

    const data =
      BranchMapper.toPersistence(branch);

    const { id, createdAt: _createdAt, ...updatable } = data;

    await this.prisma.branch.upsert({
      where: {
        id,
      },

      update: updatable,

      create: data,
    });
  }

  async delete(
    branchId: string,
  ): Promise<void> {
    this.logger.log(
      `🗑️ Soft deleting branch: ${branchId}`,
    );

    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        status: BranchStatus.INACTIVE,
        displayOrder: null,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async deletePermanent(branchId: string): Promise<void> {
    this.logger.log(
      `🗑️ Permanently deleting branch: ${branchId}`,
    );

    await this.prisma.branch.delete({
      where: { id: branchId },
    });
  }

  async countBlockingReferences(
    branchId: string,
  ): Promise<{
    branchUsers: number;
    students: number;
    trainers: number;
    enrollments: number;
    batches: number;
    categories: number;
    courseBranches: number;
  }> {
    const [
      branchUsers,
      students,
      trainers,
      enrollments,
      batches,
      categories,
      courseBranches,
    ] = await Promise.all([
      this.prisma.branchUser.count({ where: { branchId } }),
      this.prisma.student.count({ where: { branchId } }),
      this.prisma.branchTrainer.count({ where: { branchId } }),
      this.prisma.enrollment.count({ where: { branchId } }),
      this.prisma.branchBatch.count({ where: { branchId } }),
      this.prisma.branchCategory.count({
        where: { branchId },
      }),
      this.prisma.courseBranch.count({ where: { branchId } }),
    ]);

    return {
      branchUsers,
      students,
      trainers,
      enrollments,
      batches,
      categories,
      courseBranches,
    };
  }

  async getManagementCounts(branchId: string): Promise<{
    students: number;
    courses: number;
    batches: number;
    enrollments: number;
    instructors: number;
    categories: number;
  }> {
    const [
      students,
      courses,
      batches,
      enrollments,
      instructors,
      courseBranchCategories,
    ] = await Promise.all([
      this.prisma.student.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.courseBranch.count({
        where: {
          branchId,
          course: { isDeleted: false },
        },
      }),
      this.prisma.branchBatch.count({
        where: {
          branchId,
          batch: { isDeleted: false },
        },
      }),
      this.prisma.enrollment.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.branchTrainer
        .groupBy({
          by: ['trainerId'],
          where: {
            branchId,
            trainer: { isDeleted: false },
          },
        })
        .then((rows) => rows.length),
      this.prisma.courseBranch.findMany({
        where: {
          branchId,
          course: { isDeleted: false },
        },
        select: {
          course: { select: { categoryId: true } },
        },
      }),
    ]);

    const categoryIds = new Set<string>();
    for (const row of courseBranchCategories) {
      const categoryId = row.course.categoryId;
      if (categoryId) {
        categoryIds.add(categoryId);
      }
    }

    return {
      students,
      courses,
      batches,
      enrollments,
      instructors,
      categories: categoryIds.size,
    };
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(
    id: string,
  ): Promise<Branch | null> {
    const record =
      await this.prisma.branch.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

    return record
      ? BranchMapper.toDomain(record)
      : null;
  }

  async findBySlug(slug: string): Promise<Branch | null> {
    const normalized = slug.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const record = await this.prisma.branch.findFirst({
      where: {
        slug: normalized,
        deletedAt: null,
      },
    });

    return record ? BranchMapper.toDomain(record) : null;
  }

  async findBySlugIncludingDeleted(
    slug: string,
  ): Promise<Branch | null> {
    const normalized = slug.trim().toLowerCase();

    if (!normalized) {
      return null;
    }

    const record = await this.prisma.branch.findFirst({
      where: { slug: normalized },
    });

    return record ? BranchMapper.toDomain(record) : null;
  }

  async findByBranchCode(
  branchCode: string,
): Promise<Branch | null> {
  const record =
    await this.prisma.branch.findFirst({
      where: {
        branchCode,
      },
    });

  return record
    ? BranchMapper.toDomain(record)
    : null;
}

  async findByBranchNameInsensitive(
    branchName: string,
    excludeId?: string,
  ): Promise<Branch | null> {
    const normalized = branchName.trim();

    const record =
      await this.prisma.branch.findFirst({
        where: {
          branchName: {
            equals: normalized,
            mode: 'insensitive',
          },
          ...(excludeId
            ? { id: { not: excludeId } }
            : {}),
        },
      });

    return record
      ? BranchMapper.toDomain(record)
      : null;
  }

  async findAll(
    filters: BranchListFilters = {},
  ): Promise<Branch[]> {
    const where =
      this.buildWhereClause(filters);

    const records =
      await this.prisma.branch.findMany({
        where,

        orderBy: [
          {
            displayOrder: {
              sort: 'asc',
              nulls: 'last',
            },
          },
          {
            createdAt: 'asc',
          },
        ],

        skip: filters.skip,

        take: filters.take,
      });

    return records.map(
      BranchMapper.toDomain,
    );
  }

  async count(
    filters: BranchListFilters = {},
  ): Promise<number> {
    return this.prisma.branch.count({
      where: this.buildWhereClause(filters),
    });
  }

  async findByIdIncludingDeleted(
  id: string,
): Promise<Branch | null> {
  const record =
    await this.prisma.branch.findUnique({
      where: { id },
    });

  return record
    ? BranchMapper.toDomain(record)
    : null;
}

  async findByIdOrSlugIncludingDeleted(
    identifier: string,
  ): Promise<Branch | null> {
    const trimmed = identifier.trim();

    if (!trimmed) {
      return null;
    }

    const byId = await this.prisma.branch.findUnique({
      where: { id: trimmed },
    });

    if (byId) {
      return BranchMapper.toDomain(byId);
    }

    const bySlug = await this.prisma.branch.findFirst({
      where: {
        slug: trimmed.toLowerCase(),
      },
    });

    return bySlug ? BranchMapper.toDomain(bySlug) : null;
  }

  // =====================
  // ✅ EXISTS
  // =====================

  async existsById(
    id: string,
  ): Promise<boolean> {
    const count =
      await this.prisma.branch.count({
        where: {
          id,
          deletedAt: null,
        },
      });

    return count > 0;
  }

  async existsByBranchCode(
    branchCode: string,
    excludeId?: string,
  ): Promise<boolean> {
    const normalized = branchCode.trim().toUpperCase();

    const count =
      await this.prisma.branch.count({
        where: {
          branchCode: normalized,
          ...(excludeId
            ? { id: { not: excludeId } }
            : {}),
        },
      });

    return count > 0;
  }

  async getMaxNumericSuffixForPrefix(
    prefix: string,
  ): Promise<number> {
    const normalized = prefix.trim().toUpperCase();

    if (!normalized) {
      return 0;
    }

    const records = await this.prisma.branch.findMany({
      where: {
        branchCode: {
          startsWith: normalized,
        },
      },
      select: {
        branchCode: true,
      },
    });

    let max = 0;
    const pattern = new RegExp(
      `^${normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\d+)$`,
    );

    for (const record of records) {
      const match = record.branchCode.match(pattern);
      if (!match) {
        continue;
      }
      const value = Number(match[1]);
      if (!Number.isNaN(value) && value > max) {
        max = value;
      }
    }

    return max;
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.branch.aggregate({
      where: {
        deletedAt: null,
        displayOrder: { not: null },
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async getMaxActiveDisplayOrder(): Promise<number> {
    const result = await this.prisma.branch.aggregate({
      where: {
        deletedAt: null,
        status: BranchStatus.ACTIVE,
        displayOrder: { not: null },
      },
      _max: {
        displayOrder: true,
      },
    });

    return result._max.displayOrder ?? 0;
  }

  async closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.branch.updateMany({
      where: {
        deletedAt: null,
        displayOrder: {
          gt: deletedDisplayOrder,
        },
      },
      data: {
        displayOrder: {
          decrement: 1,
        },
      },
    });
  }

  async moveDisplayOrder(
    branchId: string,
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.branch.updateMany({
          where: {
            deletedAt: null,
            displayOrder: {
              gte: newOrder,
              lt: oldOrder,
            },
          },
          data: {
            displayOrder: {
              increment: 1,
            },
          },
        });
      } else {
        await tx.branch.updateMany({
          where: {
            deletedAt: null,
            displayOrder: {
              gt: oldOrder,
              lte: newOrder,
            },
          },
          data: {
            displayOrder: {
              decrement: 1,
            },
          },
        });
      }

      await tx.branch.update({
        where: { id: branchId },
        data: { displayOrder: newOrder },
      });
    });
  }

  // =====================
  // 🧠 BRANCH OPERATIONS
  // =====================

  async updateEmail(
    branchId: string,
    email: string | null,
  ): Promise<void> {
    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        email,
        updatedAt: new Date(),
      },
    });
  }

  async updatePhone(
    branchId: string,
    phone: string | null,
  ): Promise<void> {
    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        phone,
        updatedAt: new Date(),
      },
    });
  }

  async updateLocation(
    branchId: string,
    params: {
      latitude?: number | null;
      longitude?: number | null;
    },
  ): Promise<void> {
    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        latitude: params.latitude,
        longitude: params.longitude,

        updatedAt: new Date(),
      },
    });
  }

  async updateAddress(
    branchId: string,
    params: {
      addressLine1?: string | null;
      addressLine2?: string | null;

      city?: string | null;
      state?: string | null;
      country?: string | null;

      postalCode?: string | null;
    },
  ): Promise<void> {
    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        addressLine1:
          params.addressLine1,

        addressLine2:
          params.addressLine2,

        city: params.city,
        state: params.state,
        country: params.country,

        postalCode:
          params.postalCode,

        updatedAt: new Date(),
      },
    });
  }

  async updateStatus(
    branchId: string,
    status: BranchStatus,
  ): Promise<void> {
    await this.prisma.branch.update({
      where: {
        id: branchId,
      },

      data: {
        status:
          status as Prisma.BranchUpdateInput['status'],

        updatedAt: new Date(),
      },
    });
  }

  private buildWhereClause(
    filters: BranchListFilters,
  ): Prisma.BranchWhereInput {
    const where: Prisma.BranchWhereInput = {};

    if (filters.status === 'ARCHIVED') {
      where.deletedAt = { not: null };
    } else if (filters.status) {
      where.deletedAt = null;
      where.status =
        filters.status as Prisma.BranchWhereInput['status'];
    } else if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.city) {
      where.city = {
        equals: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.state) {
      where.state = {
        equals: filters.state,
        mode: 'insensitive',
      };
    }

    if (filters.country) {
      where.country = {
        equals: filters.country,
        mode: 'insensitive',
      };
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      where.OR = [
        {
          branchName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          branchCode: {
            contains: search.toUpperCase(),
          },
        },
        {
          city: {
            contains: search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }

  async findCoursesByIds(
    courseIds: string[],
  ): Promise<
    Array<{ id: string; status: string; isDeleted: boolean }>
  > {
    const uniqueIds = [...new Set(courseIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    return this.prisma.course.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        status: true,
        isDeleted: true,
      },
    });
  }

  async assignCoursesToBranch(
    branchId: string,
    courseIds: string[],
  ): Promise<number> {
    const uniqueIds = [...new Set(courseIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return 0;
    }

    let assignedCount = 0;

    for (const courseId of uniqueIds) {
      const existing = await this.prisma.courseBranch.findUnique({
        where: {
          courseId_branchId: { courseId, branchId },
        },
      });

      if (existing?.linkedViaManual) {
        continue;
      }

      await this.prisma.courseBranch.upsert({
        where: {
          courseId_branchId: { courseId, branchId },
        },
        create: {
          courseId,
          branchId,
          linkedViaManual: true,
          linkedViaBatch: existing?.linkedViaBatch ?? false,
        },
        update: {
          linkedViaManual: true,
        },
      });

      if (!existing) {
        assignedCount += 1;
      } else if (!existing.linkedViaManual) {
        assignedCount += 1;
      }
    }

    return assignedCount;
  }

  async unassignCourseFromBranch(
    branchId: string,
    courseId: string,
  ): Promise<void> {
    const row = await this.prisma.courseBranch.findUnique({
      where: {
        courseId_branchId: { courseId, branchId },
      },
    });

    if (!row) {
      return;
    }

    if (!row.linkedViaManual && row.linkedViaBatch) {
      throw new Error(
        'COURSE_LINKED_VIA_BATCH',
      );
    }

    if (row.linkedViaManual && row.linkedViaBatch) {
      await this.prisma.courseBranch.update({
        where: {
          courseId_branchId: { courseId, branchId },
        },
        data: { linkedViaManual: false },
      });
      return;
    }

    await this.prisma.courseBranch.deleteMany({
      where: { branchId, courseId },
    });
  }

  async findTrainersByIds(
    trainerIds: string[],
  ): Promise<
    Array<{ id: string; status: string; isDeleted: boolean }>
  > {
    const uniqueIds = [...new Set(trainerIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    return this.prisma.trainer.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        status: true,
        isDeleted: true,
      },
    });
  }

  async assignTrainersToBranch(
    branchId: string,
    trainerIds: string[],
  ): Promise<number> {
    const uniqueIds = [...new Set(trainerIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return 0;
    }

    let assignedCount = 0;

    for (const trainerId of uniqueIds) {
      const existing = await this.prisma.branchTrainer.findFirst({
        where: {
          branchId,
          trainerId,
          assignmentType: 'BRANCH_ONLY',
        },
      });

      if (existing) {
        continue;
      }

      await this.prisma.branchTrainer.create({
        data: {
          branchId,
          trainerId,
          assignmentType: 'BRANCH_ONLY',
        },
      });
      assignedCount += 1;
    }

    return assignedCount;
  }

  async assignCourseBatchTrainersToBranch(
    branchId: string,
    trainerIds: string[],
    context: {
      courseId: string;
      batchId: string;
      mode: string;
      batchTimingId: string;
    },
  ): Promise<number> {
    await this.validateCourseBatchTrainerContext(branchId, context);

    const uniqueIds = [...new Set(trainerIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return 0;
    }

    let assignedCount = 0;

    for (const trainerId of uniqueIds) {
      const existing = await this.prisma.branchTrainer.findFirst({
        where: {
          branchId,
          trainerId,
          assignmentType: 'COURSE_BATCH',
          courseId: context.courseId,
          batchId: context.batchId,
          mode: context.mode as never,
          batchTimingId: context.batchTimingId,
        },
      });

      if (existing) {
        continue;
      }

      await this.prisma.branchTrainer.create({
        data: {
          branchId,
          trainerId,
          assignmentType: 'COURSE_BATCH',
          courseId: context.courseId,
          batchId: context.batchId,
          mode: context.mode as never,
          batchTimingId: context.batchTimingId,
        },
      });
      assignedCount += 1;
    }

    return assignedCount;
  }

  async listBranchTrainerAssignments(branchId: string) {
    const rows = await this.prisma.branchTrainer.findMany({
      where: { branchId },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        trainer: true,
        course: {
          select: { id: true, title: true, code: true },
        },
        batch: {
          select: { id: true, name: true, code: true },
        },
        batchTiming: {
          select: {
            id: true,
            name: true,
            mode: true,
            startTime: true,
            endTime: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    return rows.map((row) => ({
      id: row.id,
      branchId: row.branchId,
      trainerId: row.trainerId,
      assignmentType: row.assignmentType as 'BRANCH_ONLY' | 'COURSE_BATCH',
      courseId: row.courseId,
      batchId: row.batchId,
      mode: row.mode,
      batchTimingId: row.batchTimingId,
      trainer: {
        id: row.trainer.id,
        firstName: row.trainer.firstName,
        lastName: row.trainer.lastName,
        employeeCode: row.trainer.employeeCode,
        qualification: row.trainer.qualification,
        specialization: row.trainer.specialization,
        status: row.trainer.status,
        profileImageUrl: row.trainer.profileImageUrl,
        email: row.trainer.email,
        isDeleted: row.trainer.isDeleted,
      },
      course: row.course,
      batch: row.batch,
      batchTiming: row.batchTiming
        ? {
            id: row.batchTiming.id,
            name: row.batchTiming.name,
            mode: row.batchTiming.mode,
            startTime: row.batchTiming.startTime,
            endTime: row.batchTiming.endTime,
            startDate: row.batchTiming.startDate,
            endDate: row.batchTiming.endDate,
            status: row.batchTiming.status,
          }
        : null,
    }));
  }

  async findAssignedTrainerIdsForCourseBatchContext(
    branchId: string,
    context: {
      courseId: string;
      batchId: string;
      mode: string;
      batchTimingId: string;
    },
  ): Promise<string[]> {
    const rows = await this.prisma.branchTrainer.findMany({
      where: {
        branchId,
        assignmentType: 'COURSE_BATCH',
        courseId: context.courseId,
        batchId: context.batchId,
        mode: context.mode as never,
        batchTimingId: context.batchTimingId,
      },
      select: { trainerId: true },
    });

    return rows.map((row) => row.trainerId);
  }

  async validateCourseBatchTrainerContext(
    branchId: string,
    context: {
      courseId: string;
      batchId: string;
      mode: string;
      batchTimingId: string;
    },
  ): Promise<void> {
    const courseLink = await this.prisma.courseBranch.findUnique({
      where: {
        courseId_branchId: {
          courseId: context.courseId,
          branchId,
        },
      },
    });

    if (!courseLink) {
      throw new Error('BRANCH_COURSE_NOT_LINKED');
    }

    const batchLink = await this.prisma.branchBatch.findUnique({
      where: {
        branchId_batchId: {
          branchId,
          batchId: context.batchId,
        },
      },
    });

    if (!batchLink) {
      throw new Error('BRANCH_BATCH_NOT_LINKED');
    }

    const batch = await this.prisma.batch.findFirst({
      where: {
        id: context.batchId,
        isDeleted: false,
      },
      select: {
        id: true,
        courseId: true,
        status: true,
        batchCourses: {
          where: { isDeleted: false },
          select: { courseId: true },
        },
      },
    });

    if (!batch) {
      throw new Error('BATCH_NOT_FOUND');
    }

    if (batch.status !== 'UPCOMING') {
      throw new Error('BATCH_NOT_UPCOMING');
    }

    const batchCourseIds = new Set<string>();

    if (batch.courseId) {
      batchCourseIds.add(batch.courseId);
    }

    for (const row of batch.batchCourses) {
      batchCourseIds.add(row.courseId);
    }

    if (!batchCourseIds.has(context.courseId)) {
      throw new Error('BATCH_COURSE_MISMATCH');
    }

    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: context.batchTimingId,
        batchId: context.batchId,
        isDeleted: false,
      },
    });

    if (!timing) {
      throw new Error('BATCH_TIMING_NOT_FOUND');
    }

    if (timing.status !== 'UPCOMING') {
      throw new Error('BATCH_TIMING_NOT_UPCOMING');
    }

    if (timing.mode !== context.mode) {
      throw new Error('BATCH_TIMING_MODE_MISMATCH');
    }
  }

  async unassignTrainerFromBranch(
    branchId: string,
    trainerId: string,
  ): Promise<void> {
    await this.prisma.branchTrainer.deleteMany({
      where: { branchId, trainerId },
    });
  }

  async unassignBranchTrainerAssignment(
    branchId: string,
    assignmentId: string,
  ): Promise<void> {
    await this.prisma.branchTrainer.deleteMany({
      where: { id: assignmentId, branchId },
    });
  }

  async findBatchesByIds(
    batchIds: string[],
  ): Promise<
    Array<{ id: string; isActive: boolean; isDeleted: boolean }>
  > {
    const uniqueIds = [...new Set(batchIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return [];
    }

    return this.prisma.batch.findMany({
      where: { id: { in: uniqueIds } },
      select: {
        id: true,
        isActive: true,
        isDeleted: true,
      },
    });
  }

  async assignBatchesToBranch(
    branchId: string,
    batchIds: string[],
  ): Promise<number> {
    const uniqueIds = [...new Set(batchIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return 0;
    }

    const result = await this.prisma.branchBatch.createMany({
      data: uniqueIds.map((batchId) => ({
        branchId,
        batchId,
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  async unassignBatchFromBranch(
    branchId: string,
    batchId: string,
  ): Promise<void> {
    await this.prisma.branchBatch.deleteMany({
      where: { branchId, batchId },
    });
  }

  async linkCoursesForAssignedBatches(
    branchId: string,
    batchIds: string[],
  ): Promise<void> {
    await linkCoursesForAssignedBatches(
      this.prisma,
      branchId,
      batchIds,
    );
  }

  async syncCourseLinksAfterBatchUnassign(
    branchId: string,
    batchId: string,
  ): Promise<void> {
    await syncCourseLinksAfterBatchUnassign(
      this.prisma,
      branchId,
      batchId,
    );
  }

  async findCourseBranchLinksAtBranch(
    branchId: string,
    courseIds: string[],
  ): Promise<
    Map<
      string,
      { linkedViaManual: boolean; linkedViaBatch: boolean }
    >
  > {
    const uniqueIds = [...new Set(courseIds.filter(Boolean))];
    const map = new Map<
      string,
      { linkedViaManual: boolean; linkedViaBatch: boolean }
    >();

    if (uniqueIds.length === 0) {
      return map;
    }

    const rows = await this.prisma.courseBranch.findMany({
      where: {
        branchId,
        courseId: { in: uniqueIds },
      },
      select: {
        courseId: true,
        linkedViaManual: true,
        linkedViaBatch: true,
      },
    });

    for (const row of rows) {
      map.set(row.courseId, {
        linkedViaManual: row.linkedViaManual,
        linkedViaBatch: row.linkedViaBatch,
      });
    }

    return map;
  }
}