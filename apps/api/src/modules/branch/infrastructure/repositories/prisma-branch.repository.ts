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
      this.prisma.trainer.count({ where: { branchId } }),
      this.prisma.enrollment.count({ where: { branchId } }),
      this.prisma.batch.count({ where: { branchId } }),
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
      categories,
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
      this.prisma.batch.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.enrollment.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.trainer.count({
        where: { branchId, isDeleted: false },
      }),
      this.prisma.branchCategory.count({
        where: {
          branchId,
          category: {
            isDeleted: false,
            status: 'ACTIVE',
          },
        },
      }),
    ]);

    return {
      students,
      courses,
      batches,
      enrollments,
      instructors,
      categories,
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
}