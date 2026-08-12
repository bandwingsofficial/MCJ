import { FinancialArticle } from '../entities/financial-article.entity';
import { FinancialArticleStatus } from '../enums/financial-article-status.enum';

export interface FinancialArticleCategoryView {
  id: string;
  name: string;
  slug: string;
}

export interface FinancialArticleRelatedView {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  authorName: string;
  tags: string[];
  publishedAt: Date | null;
  createdAt: Date;
}

export interface FinancialArticleDetailView {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string | null;
  thumbnailFileId: string | null;
  thumbnailUrl: string | null;
  bannerFileId: string | null;
  bannerUrl: string | null;
  authorName: string;
  authorImage: string | null;
  tags: string[];
  categoryId: string;
  category: FinancialArticleCategoryView;
  displayOrder: number;
  status: FinancialArticleStatus;
  isActive: boolean;
  publishedAt: Date | null;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialArticleListFilters {
  categoryId?: string;
  status?: FinancialArticleStatus;
  search?: string;
  includeDeleted?: boolean;
  onlyPublished?: boolean;
  skip?: number;
  take?: number;
}

export interface FinancialArticleRepository {
  save(article: FinancialArticle): Promise<void>;
  findById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<FinancialArticle | null>;
  findBySlug(
    slug: string,
    includeDeleted?: boolean,
  ): Promise<FinancialArticle | null>;
  findDetailById(
    id: string,
    includeDeleted?: boolean,
  ): Promise<FinancialArticleDetailView | null>;
  findDetailBySlug(
    slug: string,
    includeDeleted?: boolean,
  ): Promise<FinancialArticleDetailView | null>;
  findMany(
    filters?: FinancialArticleListFilters,
  ): Promise<FinancialArticleDetailView[]>;
  findPublished(
    filters?: FinancialArticleListFilters,
  ): Promise<FinancialArticleDetailView[]>;
  findRelatedArticles(
    categoryId: string,
    excludeId: string,
    limit?: number,
  ): Promise<FinancialArticleRelatedView[]>;
  exists(slug: string, excludeId?: string): Promise<boolean>;
  getMaxDisplayOrder(): Promise<number>;
  shiftDisplayOrders(
    oldOrder: number,
    newOrder: number,
  ): Promise<void>;
  closeDisplayOrderGap(deletedDisplayOrder: number): Promise<void>;
  move(
    id: string,
    oldOrder: number,
    newOrder: number,
    updatedBy?: string | null,
  ): Promise<void>;
  deletePermanent(id: string): Promise<void>;
}
