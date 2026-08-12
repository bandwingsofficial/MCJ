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

    await this.prisma.branch.upsert({
      where: {
        id: branch.id,
      },

      update: {
        ...data,
      },

      create: {
        ...data,
      },
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
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
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

  async findAll(
    filters: BranchListFilters = {},
  ): Promise<Branch[]> {
    const where =
      this.buildWhereClause(filters);

    const records =
      await this.prisma.branch.findMany({
        where,

        orderBy: {
          createdAt: 'desc',
        },

        skip: filters.skip,

        take: filters.take,
      });

    return records.map(
      BranchMapper.toDomain,
    );
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
  ): Promise<boolean> {
    const count =
      await this.prisma.branch.count({
        where: {
          branchCode,
          deletedAt: null,
        },
      });

    return count > 0;
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

    if (!filters.includeDeleted) {
      where.deletedAt = null;
    }

    if (filters.status) {
      where.status =
        filters.status as Prisma.BranchWhereInput['status'];
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