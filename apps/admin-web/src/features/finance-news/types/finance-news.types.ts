export type FinanceArticleStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "ARCHIVED";

export type FinanceNewsManagementStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type FinanceNewsFilterStatus = FinanceNewsManagementStatus;

export interface FinanceNewsCategory {
  id: string;
  name: string;
  slug: string;
}

export interface FinanceNewsListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  category: FinanceNewsCategory;
  displayOrder: number;
  status: FinanceArticleStatus;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceNewsDetails extends FinanceNewsListItem {
  content: string | null;
  thumbnailFileId: string | null;
  bannerFileId: string | null;
  bannerUrl: string | null;
  authorName: string;
  authorImage: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  tags: string[];
  categoryId: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export interface FinanceNewsFilters {
  search?: string;
  status?: FinanceNewsFilterStatus;
  categoryId?: string;
  includeDeleted?: boolean;
  isDeleted?: boolean;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

export interface FinanceNewsListMeta {
  total: number;
  skip: number;
  take: number;
}

export interface CreateFinanceNewsRequest {
  title: string;
  categoryId: string;
  content: string;
  shortDescription?: string;
  thumbnailFileId?: string;
  bannerFileId?: string;
  authorName?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  status?: FinanceArticleStatus;
}

export interface UpdateFinanceNewsRequest {
  title?: string;
  shortDescription?: string;
  content?: string;
  thumbnailFileId?: string | null;
  bannerFileId?: string | null;
  authorName?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string[];
  categoryId?: string;
  status?: FinanceArticleStatus;
}

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface FinanceNewsDeleteResponse {
  id: string;
  deleted: boolean;
  deletedAt: string;
}

export interface FinanceNewsPermanentDeleteResponse {
  id: string;
  permanentlyDeleted: boolean;
}

export interface BulkFinanceNewsItemResult {
  id: string;
  success: boolean;
  message: string;
}

export interface BulkFinanceNewsOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkFinanceNewsItemResult[];
  failures: BulkFinanceNewsItemResult[];
}
