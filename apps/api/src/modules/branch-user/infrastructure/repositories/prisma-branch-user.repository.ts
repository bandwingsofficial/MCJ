import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import type {
  BranchUserListFilters,
  BranchUserRepository,
} from '../../domain/repositories/branch-user.repository';

import { BranchUser } from '../../domain/entities/branch-user.entity';
import { BranchUserMapper } from '../mappers/branch-user.mapper';
import { BranchUserEmail } from '../../domain/value-objects/branch-user-email.vo';
import { BranchUserPhone } from '../../domain/value-objects/branch-user-phone.vo';

export class PrismaBranchUserRepository
  implements BranchUserRepository
{
  private readonly logger = new Logger(
    PrismaBranchUserRepository.name,
  );

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================
  // 💾 SAVE
  // =====================

  async save(
    branchUser: BranchUser,
  ): Promise<void> {
    this.logger.log(
      `💾 Saving branch user: ${branchUser.id}`,
    );

    const data =
      BranchUserMapper.toPersistence(branchUser);

    await this.prisma.branchUser.upsert({
      where: {
        id: branchUser.id,
      },
      update: {
        ...data,
      },
      create: {
        ...data,
      },
    });
  }

  // =====================
  // 🔍 FINDERS
  // =====================

  async findById(
    id: string,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          id,
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findByEmail(
    email: BranchUserEmail,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          email: email.getValue(),
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findByPhone(
    phone: BranchUserPhone,
  ): Promise<BranchUser | null> {
    const record =
      await this.prisma.branchUser.findFirst({
        where: {
          phone: phone.getValue(),
          isDeleted: false,
        },
      });

    return record
      ? BranchUserMapper.toDomain(record)
      : null;
  }

  async findAll(
    filters: BranchUserListFilters = {},
  ): Promise<BranchUser[]> {
    const records =
      await this.prisma.branchUser.findMany({
        where: this.buildWhere(filters),
        orderBy: {
          createdAt: 'desc',
        },
        skip: filters.skip,
        take: filters.take,
      });

    return records.map(
      BranchUserMapper.toDomain,
    );
  }

  async count(
    filters: BranchUserListFilters = {},
  ): Promise<number> {
    return this.prisma.branchUser.count({
      where: this.buildWhere(filters),
    });
  }

  async findByIdIncludingDeleted(
  id: string,
): Promise<BranchUser | null> {
  const record =
    await this.prisma.branchUser.findUnique({
      where: { id },
    });

  return record
    ? BranchUserMapper.toDomain(record)
    : null;
}

  // =====================
  // ✅ EXISTS
  // =====================

  async existsById(id: string): Promise<boolean> {
    const count =
      await this.prisma.branchUser.count({
        where: {
          id,
          isDeleted: false,
        },
      });

    return count > 0;
  }

  async existsByEmail(
    email: BranchUserEmail,
  ): Promise<boolean> {
    const count =
      await this.prisma.branchUser.count({
        where: {
          email: email.getValue(),
          isDeleted: false,
        },
      });

    return count > 0;
  }

  async existsByPhone(
    phone: BranchUserPhone,
  ): Promise<boolean> {
    const count =
      await this.prisma.branchUser.count({
        where: {
          phone: phone.getValue(),
          isDeleted: false,
        },
      });

    return count > 0;
  }

  async branchExists(
    branchId: string,
  ): Promise<boolean> {
    const count = await this.prisma.branch.count({
      where: {
        id: branchId,
        deletedAt: null,
      },
    });

    return count > 0;
  }

  private buildWhere(
    filters: BranchUserListFilters,
  ): Prisma.BranchUserWhereInput {
    const where: Prisma.BranchUserWhereInput = {};

    if (filters.isDeleted === true) {
      where.isDeleted = true;
    } else if (filters.isDeleted === false) {
      where.isDeleted = false;
    } else if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.branchId) {
      where.branchId = filters.branchId;
    }

    if (filters.role) {
      where.role = filters.role;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();

      where.OR = [
        {
          firstName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          lastName: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          email: {
            contains: search.toLowerCase(),
            mode: 'insensitive',
          },
        },
        {
          phone: {
            contains: search,
          },
        },
      ];
    }

    return where;
  }

  async rotateRefreshTokenIfMatches(params: {
    branchUserId: string;
    expectedHash: string;
    newHash: string;
    expiresAt: Date;
  }): Promise<boolean> {
    const result = await this.prisma.branchUser.updateMany({
      where: {
        id: params.branchUserId,
        refreshToken: params.expectedHash,
        isDeleted: false,
        isActive: true,
      },
      data: {
        refreshToken: params.newHash,
        refreshTokenExpiresAt: params.expiresAt,
        updatedAt: new Date(),
      },
    });

    return result.count === 1;
  }
}
