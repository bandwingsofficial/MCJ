import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import {
  CategoryListFilters,
  CategoryRepository,
} from '../../domain/repositories/category.repository';
import { CategoryName } from '../../domain/value-objects/category-name.vo';
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

  async findByNameInsensitive(
    name: string,
    branchId?: string | null,
    includeDeleted = false,
  ): Promise<Category | null> {
    const normalized = CategoryName.normalize(name);
    const key = CategoryName.uniquenessKey(normalized);

    const record = await this.prisma.category.findFirst({
      where: {
        branchId: branchId ?? null,
        ...(includeDeleted ? {} : { isDeleted: false }),
        name: {
          equals: normalized,
          mode: 'insensitive',
        },
      },
    });

    if (record) {
      return CategoryMapper.toDomain(record);
    }

    // Legacy rows may still have uncollapsed whitespace
    const candidates = await this.prisma.category.findMany({
      where: {
        branchId: branchId ?? null,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      take: 500,
    });

    const match = candidates.find(
      (item) => CategoryName.uniquenessKey(item.name) === key,
    );

    return match ? CategoryMapper.toDomain(match) : null;
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

  async count(
    filters: CategoryListFilters = {},
  ): Promise<number> {
    return this.prisma.category.count({
      where: this.buildWhere(filters),
    });
  }

  async countBlockingReferences(id: string): Promise<{
    courses: number;
    enrollments: number;
    articles: number;
  }> {
    const [courses, enrollments, articles] = await Promise.all([
      this.prisma.course.count({ where: { categoryId: id } }),
      this.prisma.enrollment.count({ where: { categoryId: id } }),
      this.prisma.financialArticle.count({
        where: { categoryId: id },
      }),
    ]);

    return { courses, enrollments, articles };
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
        displayOrder: { not: null },
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
    const result = await this.prisma.category.aggregate({
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

  async moveDisplayOrder(
    categoryId: string,
    oldOrder: number,
    newOrder: number,
    branchId?: string | null,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.category.updateMany({
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
        await tx.category.updateMany({
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

      await tx.category.update({
        where: { id: categoryId },
        data: { displayOrder: newOrder },
      });
    });
  }

  async reorderOrderedCategories(
    orderedIds: string[],
    branchId?: string | null,
  ): Promise<void> {
    const uniqueIds = [...new Set(orderedIds)];

    if (uniqueIds.length !== orderedIds.length) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Duplicate category ids in reorder payload',
        400,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const ordered = await tx.category.findMany({
        where: {
          branchId: branchId ?? null,
          isDeleted: false,
          displayOrder: { not: null },
        },
        select: { id: true },
        orderBy: { displayOrder: 'asc' },
      });

      const existingIds = new Set(ordered.map((item) => item.id));
      const payloadIds = new Set(uniqueIds);

      if (
        existingIds.size !== payloadIds.size ||
        ![...payloadIds].every((id) => existingIds.has(id))
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Reorder payload must include every ordered category exactly once',
          400,
        );
      }

      // Two-phase update avoids transient duplicate displayOrder values
      for (let i = 0; i < uniqueIds.length; i++) {
        await tx.category.update({
          where: { id: uniqueIds[i] },
          data: { displayOrder: -(i + 1) },
        });
      }

      for (let i = 0; i < uniqueIds.length; i++) {
        await tx.category.update({
          where: { id: uniqueIds[i] },
          data: { displayOrder: i + 1 },
        });
      }
    });
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
