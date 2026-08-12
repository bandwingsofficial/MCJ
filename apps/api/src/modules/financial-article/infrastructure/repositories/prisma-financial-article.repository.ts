import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import { FinancialArticle } from '../../domain/entities/financial-article.entity';
import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';
import {
  FinancialArticleDetailView,
  FinancialArticleListFilters,
  FinancialArticleRelatedView,
  FinancialArticleRepository,
} from '../../domain/repositories/financial-article.repository';
import { FinancialArticleMapper } from '../mappers/financial-article.mapper';
import {
  FinancialArticleResponseMapper,
  financialArticleDetailInclude,
} from '../mappers/financial-article-response.mapper';

export class PrismaFinancialArticleRepository
  implements FinancialArticleRepository
{
  private readonly logger = new Logger(
    PrismaFinancialArticleRepository.name,
  );

  constructor(private readonly prisma: PrismaService) {}

  async save(article: FinancialArticle): Promise<void> {
    this.logger.log(`💾 Saving financial article: ${article.id}`);

    const data = FinancialArticleMapper.toPersistence(article);

    await this.prisma.financialArticle.upsert({
      where: { id: article.id },
      update: { ...data },
      create: { ...data },
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<FinancialArticle | null> {
    const record = await this.prisma.financialArticle.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? FinancialArticleMapper.toDomain(record) : null;
  }

  async findBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<FinancialArticle | null> {
    const record = await this.prisma.financialArticle.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? FinancialArticleMapper.toDomain(record) : null;
  }

  async findDetailById(
    id: string,
    includeDeleted = false,
  ): Promise<FinancialArticleDetailView | null> {
    const record = await this.prisma.financialArticle.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: financialArticleDetailInclude,
    });

    return record
      ? FinancialArticleResponseMapper.toDetail(record)
      : null;
  }

  async findDetailBySlug(
    slug: string,
    includeDeleted = false,
  ): Promise<FinancialArticleDetailView | null> {
    const record = await this.prisma.financialArticle.findFirst({
      where: {
        slug,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
      include: financialArticleDetailInclude,
    });

    return record
      ? FinancialArticleResponseMapper.toDetail(record)
      : null;
  }

  async findMany(
    filters: FinancialArticleListFilters = {},
  ): Promise<FinancialArticleDetailView[]> {
    const records = await this.prisma.financialArticle.findMany({
      where: this.buildWhere(filters),
      include: financialArticleDetailInclude,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      skip: filters.skip,
      take: filters.take,
    });

    return FinancialArticleResponseMapper.toDetailList(records);
  }

  async findPublished(
    filters: FinancialArticleListFilters = {},
  ): Promise<FinancialArticleDetailView[]> {
    const records = await this.prisma.financialArticle.findMany({
      where: {
        ...this.buildWhere(filters),
        status: FinancialArticleStatus.PUBLISHED,
        isActive: true,
        isDeleted: false,
      },
      include: financialArticleDetailInclude,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      skip: filters.skip,
      take: filters.take,
    });

    return FinancialArticleResponseMapper.toDetailList(records);
  }

  async findRelatedArticles(
    categoryId: string,
    excludeId: string,
    limit = 5,
  ): Promise<FinancialArticleRelatedView[]> {
    const records = await this.prisma.financialArticle.findMany({
      where: {
        categoryId,
        id: { not: excludeId },
        status: FinancialArticleStatus.PUBLISHED,
        isActive: true,
        isDeleted: false,
      },
      include: financialArticleDetailInclude,
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 3), 5),
    });

    return FinancialArticleResponseMapper.toRelatedList(records);
  }

  async exists(slug: string, excludeId?: string): Promise<boolean> {
    const record = await this.prisma.financialArticle.findFirst({
      where: {
        slug,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(record);
  }

  async getMaxDisplayOrder(): Promise<number> {
    const result = await this.prisma.financialArticle.aggregate({
      where: { isDeleted: false },
      _max: { displayOrder: true },
    });

    return result._max.displayOrder ?? 0;
  }

  async shiftDisplayOrders(
    oldOrder: number,
    newOrder: number,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    if (newOrder < oldOrder) {
      await this.prisma.financialArticle.updateMany({
        where: {
          isDeleted: false,
          displayOrder: { gte: newOrder, lt: oldOrder },
        },
        data: { displayOrder: { increment: 1 } },
      });
    } else {
      await this.prisma.financialArticle.updateMany({
        where: {
          isDeleted: false,
          displayOrder: { gt: oldOrder, lte: newOrder },
        },
        data: { displayOrder: { decrement: 1 } },
      });
    }
  }

  async closeDisplayOrderGap(
    deletedDisplayOrder: number,
  ): Promise<void> {
    await this.prisma.financialArticle.updateMany({
      where: {
        isDeleted: false,
        displayOrder: { gt: deletedDisplayOrder },
      },
      data: { displayOrder: { decrement: 1 } },
    });
  }

  async move(
    id: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void> {
    if (oldOrder === newOrder) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      if (newOrder < oldOrder) {
        await tx.financialArticle.updateMany({
          where: {
            isDeleted: false,
            displayOrder: { gte: newOrder, lt: oldOrder },
          },
          data: { displayOrder: { increment: 1 } },
        });
      } else {
        await tx.financialArticle.updateMany({
          where: {
            isDeleted: false,
            displayOrder: { gt: oldOrder, lte: newOrder },
          },
          data: { displayOrder: { decrement: 1 } },
        });
      }

      await tx.financialArticle.update({
        where: { id },
        data: {
          displayOrder: newOrder,
          updatedBy: updatedBy ?? undefined,
          updatedAt: new Date(),
        },
      });
    });
  }

  async deletePermanent(id: string): Promise<void> {
    await this.prisma.financialArticle.delete({
      where: { id },
    });
  }

  private buildWhere(
    filters: FinancialArticleListFilters,
  ): Prisma.FinancialArticleWhereInput {
    const where: Prisma.FinancialArticleWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search) {
      where.OR = [
        {
          title: {
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
        {
          shortDescription: {
            contains: filters.search,
            mode: 'insensitive',
          },
        },
      ];
    }

    return where;
  }
}
