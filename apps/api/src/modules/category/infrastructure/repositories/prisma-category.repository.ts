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
    includeDeleted = false,
  ): Promise<Category | null> {
    const record = await this.prisma.category.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CategoryMapper.toDomain(record) : null;
  }

  async findByNameInsensitive(
    name: string,
    includeDeleted = false,
  ): Promise<Category | null> {
    const normalized = CategoryName.normalize(name);
    const key = CategoryName.uniquenessKey(normalized);

    const record = await this.prisma.category.findFirst({
      where: {
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

    const candidates = await this.prisma.category.findMany({
      where: {
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
    branches: number;
  }> {
    const [courses, enrollments, articles, branches] =
      await Promise.all([
        this.prisma.course.count({ where: { categoryId: id } }),
        this.prisma.enrollment.count({
          where: { categoryId: id },
        }),
        this.prisma.financialArticle.count({
          where: { categoryId: id },
        }),
        this.prisma.branchCategory.count({
          where: { categoryId: id },
        }),
      ]);

    return {
      courses,
      enrollments,
      articles,
      branches,
    };
  }

  async removeBranchAssignments(
    categoryId: string,
  ): Promise<number> {
    const result = await this.prisma.branchCategory.deleteMany({
      where: { categoryId },
    });
    return result.count;
  }

  async assignCategoriesToBranch(
    branchId: string,
    categoryIds: string[],
  ): Promise<number> {
    const uniqueIds = [...new Set(categoryIds.filter(Boolean))];
    if (uniqueIds.length === 0) {
      return 0;
    }

    const result = await this.prisma.branchCategory.createMany({
      data: uniqueIds.map((categoryId) => ({
        branchId,
        categoryId,
      })),
      skipDuplicates: true,
    });

    return result.count;
  }

  async unassignCategoryFromBranch(
    branchId: string,
    categoryId: string,
  ): Promise<void> {
    await this.prisma.branchCategory.deleteMany({
      where: { branchId, categoryId },
    });
  }

  async isAssignedToBranch(
    categoryId: string,
    branchId: string,
  ): Promise<boolean> {
    const row = await this.prisma.branchCategory.findUnique({
      where: {
        branchId_categoryId: {
          branchId,
          categoryId,
        },
      },
      select: { id: true },
    });

    return Boolean(row);
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.category.delete({
        where: { id },
      });

      const ordered = await tx.category.findMany({
        where: {
          isDeleted: false,
          displayOrder: { not: null },
        },
        select: { id: true },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      for (let i = 0; i < ordered.length; i++) {
        await tx.category.update({
          where: { id: ordered[i].id },
          data: { displayOrder: -(i + 1) },
        });
      }

      for (let i = 0; i < ordered.length; i++) {
        await tx.category.update({
          where: { id: ordered[i].id },
          data: { displayOrder: i + 1 },
        });
      }
    });
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.category.aggregate({
      where: {
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
  ): Promise<void> {
    await this.prisma.category.updateMany({
      where: {
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
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    if (newOrder < oldOrder) {
      await this.prisma.category.updateMany({
        where: {
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
  ): Promise<void> {
    await this.prisma.category.updateMany({
      where: {
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

  async getMaxActiveDisplayOrder(): Promise<number> {
    const result = await this.prisma.category.aggregate({
      where: {
        isDeleted: false,
        status: CategoryStatus.ACTIVE,
        displayOrder: { not: null },
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
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.category.updateMany({
          where: {
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

  async normalizeOrderedDisplayOrders(): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const ordered = await tx.category.findMany({
        where: {
          isDeleted: false,
          displayOrder: { not: null },
        },
        select: { id: true },
        orderBy: [
          { displayOrder: 'asc' },
          { createdAt: 'asc' },
        ],
      });

      for (let i = 0; i < ordered.length; i++) {
        await tx.category.update({
          where: { id: ordered[i].id },
          data: { displayOrder: -(i + 1) },
        });
      }

      for (let i = 0; i < ordered.length; i++) {
        await tx.category.update({
          where: { id: ordered[i].id },
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
      where.branchCategories = {
        some: { branchId: filters.branchId },
      };
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
