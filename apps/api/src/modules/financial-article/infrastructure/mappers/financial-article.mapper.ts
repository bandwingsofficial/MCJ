import { FinancialArticle as PrismaFinancialArticle, Prisma } from '@prisma/client';

import { FinancialArticle } from '../../domain/entities/financial-article.entity';
import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';

export class FinancialArticleMapper {
  static toDomain(record: PrismaFinancialArticle): FinancialArticle {
    return FinancialArticle.reconstitute({
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
      displayOrder: record.displayOrder,
      status: record.status as FinancialArticleStatus,
      isActive: record.isActive,
      publishedAt: record.publishedAt,
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    article: FinancialArticle,
  ): Prisma.FinancialArticleUncheckedCreateInput {
    return {
      id: article.id,
      title: article.title.getValue(),
      slug: article.slug.getValue(),
      shortDescription: article.shortDescription.getValue(),
      content: article.content.getValue(),
      thumbnailFileId: article.thumbnailFileId,
      thumbnailUrl: article.thumbnailUrl,
      bannerFileId: article.bannerFileId,
      bannerUrl: article.bannerUrl,
      authorName: article.authorName.getValue(),
      authorImage: article.authorImage,
      tags: article.tags,
      categoryId: article.categoryId,
      displayOrder: article.displayOrder,
      status: article.status,
      isActive: article.isActive,
      publishedAt: article.publishedAt,
      createdBy: article.createdBy,
      updatedBy: article.updatedBy,
      isDeleted: article.isDeleted,
      deletedAt: article.deletedAt,
      deletedBy: article.deletedBy,
      createdAt: article.createdAt,
      updatedAt: article.updatedAt,
    };
  }
}
