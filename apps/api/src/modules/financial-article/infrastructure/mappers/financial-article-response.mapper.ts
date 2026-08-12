import { Prisma } from '@prisma/client';

import {
  FinancialArticleCategoryView,
  FinancialArticleDetailView,
  FinancialArticleRelatedView,
} from '../../domain/repositories/financial-article.repository';
import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

export const financialArticleDetailInclude = {
  category: true,
} satisfies Prisma.FinancialArticleInclude;

type FinancialArticleWithCategory = Prisma.FinancialArticleGetPayload<{
  include: typeof financialArticleDetailInclude;
}>;

export class FinancialArticleResponseMapper {
  static toCategory(
    category: FinancialArticleWithCategory['category'],
  ): FinancialArticleCategoryView {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
    };
  }

  static toDetail(
    record: FinancialArticleWithCategory,
  ): FinancialArticleDetailView {
    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      shortDescription: record.shortDescription,
      content: record.content,
      thumbnailFileId: record.thumbnailFileId,
      thumbnailUrl: record.thumbnailUrl,
      bannerFileId: record.bannerFileId,
      bannerUrl: record.bannerUrl,
      authorName: record.authorName,
      authorImage: record.authorImage,
      tags: record.tags,
      categoryId: record.categoryId,
      category: this.toCategory(record.category),
      displayOrder: record.displayOrder,
      status: record.status as FinancialArticleStatus,
      isActive: record.isActive,
      publishedAt: record.publishedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static toDetailList(
    records: FinancialArticleWithCategory[],
  ): FinancialArticleDetailView[] {
    return records.map((record) => this.toDetail(record));
  }

  static toRelated(
    record: FinancialArticleWithCategory,
  ): FinancialArticleRelatedView {
    return {
      id: record.id,
      title: record.title,
      slug: record.slug,
      shortDescription: record.shortDescription,
      thumbnailUrl: record.thumbnailUrl,
      authorName: record.authorName,
      tags: record.tags,
      publishedAt: record.publishedAt,
      createdAt: record.createdAt,
    };
  }

  static toRelatedList(
    records: FinancialArticleWithCategory[],
  ): FinancialArticleRelatedView[] {
    return records.map((record) => this.toRelated(record));
  }
}
