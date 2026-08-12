import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import {
  CategoryListFilters,
  CategoryRepository,
} from '../../domain/repositories/category.repository';
import { CategoryMapper } from '../mappers/category.mapper';

export class PrismaCategoryRepository
  implements CategoryRepository
{
  private readonly logger = new Logger(
    PrismaCategoryRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(category: Category): Promise<void> {
    this.logger.log(`💾 Saving category: ${category.id}`);

    const data = CategoryMapper.toPersistence(category);

    await this.prisma.category.upsert({
      where: { id: category.id },
      update: {
        ...data,
      },
      create: {
        ...data,
      },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CategoryMapper.toDomain(record) : null;
  }

  async findBySlug(
    slug: string,
    branchId?: string | null,
    includeDeleted = false,
  ): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({
      where: {
        slug,
        branchId: branchId ?? null,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CategoryMapper.toDomain(record) : null;
  }

  async findAll(
    filters: CategoryListFilters = {},
  ): Promise<Category[]> {
    const records = await this.prisma.category.findMany({
      where: this.buildWhere(filters),
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
      skip: filters.skip,
      take: filters.take,
    });

    return records.map(CategoryMapper.toDomain);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    });
  }
  async getMaxDisplayOrder(
  branchId?: string | null,
): Promise<number> {
  const result = await this.prisma.category.aggregate({
    where: {
      branchId: branchId ?? null,
      isDeleted: false,
    },
    _max: {
      displayOrder: true,
    },
  });

  return result._max.displayOrder ?? 0;
}

async incrementDisplayOrdersFrom(
  displayOrder: number,
  branchId?: string | null,
): Promise<void> {
  await this.prisma.category.updateMany({
    where: {
      branchId: branchId ?? null,
      isDeleted: false,
      displayOrder: {
        gte: displayOrder,
      },
    },
    data: {
      displayOrder: {
        increment: 1,
      },
    },
  });
}

async shiftDisplayOrders(
  oldOrder: number,
  newOrder: number,
  branchId?: string | null,
): Promise<void> {
  if (oldOrder === newOrder) {
    return;
  }

  if (newOrder < oldOrder) {
    // Moving up
    await this.prisma.category.updateMany({
      where: {
        branchId: branchId ?? null,
        isDeleted: false,
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
    // Moving down
    await this.prisma.category.updateMany({
      where: {
        branchId: branchId ?? null,
        isDeleted: false,
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
}
async closeDisplayOrderGap(
  deletedDisplayOrder: number,
  branchId?: string | null,
): Promise<void> {
  await this.prisma.category.updateMany({
    where: {
      branchId: branchId ?? null,
      isDeleted: false,
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
async getMaxActiveDisplayOrder(
  branchId?: string | null,
): Promise<number> {
  const result =
    await this.prisma.category.aggregate({
      where: {
        branchId: branchId ?? null,
        isDeleted: false,
        status: CategoryStatus.ACTIVE,
      },
      _max: {
        displayOrder: true,
      },
    });

  return result._max.displayOrder ?? 0;
}

  private buildWhere(
    filters: CategoryListFilters,
  ): Prisma.CategoryWhereInput {
    const where: Prisma.CategoryWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyActive) {
      where.status = CategoryStatus.ACTIVE;
    } else if (filters.status) {
      where.status = filters.status;
    }

    if (filters.branchId !== undefined) {
      where.branchId = filters.branchId;
    }

    if (filters.search) {
      where.OR = [
        {
          name: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
