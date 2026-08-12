import { FinancialArticleStatus } from '../domain/enums/financial-article-status.enum';
import {
  FinancialArticleCategoryView,
  FinancialArticleDetailView,
  FinancialArticleRelatedView,
} from '../domain/repositories/financial-article.repository';

export class FinancialArticleResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly shortDescription: string | null,
    public readonly content: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly bannerUrl: string | null,
    public readonly authorName: string,
    public readonly tags: string[],
    public readonly category: FinancialArticleCategoryView,
    public readonly displayOrder: number,
    public readonly status: FinancialArticleStatus,
    public readonly isActive: boolean,
    public readonly publishedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly relatedArticles: FinancialArticleRelatedView[] = [],
  ) {}
}

export class FinancialArticleAdminResult extends FinancialArticleResult {
  constructor(
    id: string,
    title: string,
    slug: string,
    shortDescription: string | null,
    content: string | null,
    public readonly thumbnailFileId: string | null,
    thumbnailUrl: string | null,
    public readonly bannerFileId: string | null,
    bannerUrl: string | null,
    authorName: string,
    public readonly authorImage: string | null,
    tags: string[],
    public readonly categoryId: string,
    category: FinancialArticleCategoryView,
    displayOrder: number,
    status: FinancialArticleStatus,
    isActive: boolean,
    publishedAt: Date | null,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    createdAt: Date,
    updatedAt: Date,
    relatedArticles: FinancialArticleRelatedView[] = [],
  ) {
    super(
      id,
      title,
      slug,
      shortDescription,
      content,
      thumbnailUrl,
      bannerUrl,
      authorName,
      tags,
      category,
      displayOrder,
      status,
      isActive,
      publishedAt,
      createdAt,
      updatedAt,
      relatedArticles,
    );
  }

  static fromDetail(
    detail: FinancialArticleDetailView,
    relatedArticles: FinancialArticleRelatedView[] = [],
  ): FinancialArticleAdminResult {
    return new FinancialArticleAdminResult(
      detail.id,
      detail.title,
      detail.slug,
      detail.shortDescription,
      detail.content,
      detail.thumbnailFileId,
      detail.thumbnailUrl,
      detail.bannerFileId,
      detail.bannerUrl,
      detail.authorName,
      detail.authorImage,
      detail.tags,
      detail.categoryId,
      detail.category,
      detail.displayOrder,
      detail.status,
      detail.isActive,
      detail.publishedAt,
      detail.createdBy,
      detail.updatedBy,
      detail.isDeleted,
      detail.deletedAt,
      detail.createdAt,
      detail.updatedAt,
      relatedArticles,
    );
  }
}

export class FinancialArticlePublicResult extends FinancialArticleResult {
  static fromDetail(
    detail: FinancialArticleDetailView,
    relatedArticles: FinancialArticleRelatedView[] = [],
  ): FinancialArticlePublicResult {
    return new FinancialArticlePublicResult(
      detail.id,
      detail.title,
      detail.slug,
      detail.shortDescription,
      detail.content,
      detail.thumbnailUrl,
      detail.bannerUrl,
      detail.authorName,
      detail.tags,
      detail.category,
      detail.displayOrder,
      detail.status,
      detail.isActive,
      detail.publishedAt,
      detail.createdAt,
      detail.updatedAt,
      relatedArticles,
    );
  }

  static fromDetailList(
    details: FinancialArticleDetailView[],
  ): FinancialArticlePublicResult[] {
    return details.map(
      (detail) =>
        new FinancialArticlePublicResult(
          detail.id,
          detail.title,
          detail.slug,
          detail.shortDescription,
          null,
          detail.thumbnailUrl,
          detail.bannerUrl,
          detail.authorName,
          detail.tags,
          detail.category,
          detail.displayOrder,
          detail.status,
          detail.isActive,
          detail.publishedAt,
          detail.createdAt,
          detail.updatedAt,
        ),
    );
  }
}
