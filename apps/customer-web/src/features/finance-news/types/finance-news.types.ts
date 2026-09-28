export interface FinancialArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FinancialArticleListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  content: string | null;
  thumbnailUrl: string | null;
  bannerUrl: string | null;
  authorName: string;
  tags: string[];
  category: FinancialArticleCategory;
  displayOrder: number;
  status: string;
  isActive: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialArticleRelatedItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  authorName: string;
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
}

export interface FinancialArticleDetail extends FinancialArticleListItem {
  content: string | null;
  relatedArticles?: FinancialArticleRelatedItem[];
}

export interface ListFinancialArticlesParams {
  skip?: number;
  take?: number;
  search?: string;
  categoryId?: string;
}

export interface ListFinancialArticlesResponse {
  success: boolean;
  message: string;
  data: FinancialArticleListItem[];
  meta?: {
    total: number;
    skip?: number;
    take?: number;
  };
}

export interface GetFinancialArticleResponse {
  success: boolean;
  message: string;
  data: FinancialArticleDetail;
}
