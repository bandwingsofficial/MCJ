export type CategoryStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export interface Category {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  thumbnailFileId: string | null;

  thumbnailUrl: string | null;

  status: CategoryStatus;

  displayOrder: number | null;

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CategoryDetails
  extends Category {}

export interface CreateCategoryRequest {
  name: string;

  description?: string;

  status?: Exclude<CategoryStatus, "ARCHIVED">;

  thumbnailFileId?: string | null;
}

export interface UpdateCategoryRequest {
  name?: string;

  description?: string;

  status?: Exclude<CategoryStatus, "ARCHIVED">;

  thumbnailFileId?: string | null;
}

export interface CategoryListItem {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  status: CategoryStatus;

  displayOrder: number | null;

  isDeleted: boolean;

  createdAt: string;

  updatedAt: string;

  thumbnailUrl: string | null;
}

export type CategoryListResponse =
  CategoryListItem[];

export interface CategoryListMeta {
  total: number;
  skip: number;
  take: number;
}

export interface CategoryFilters {
  search: string;

  /** Filter to categories assigned to this branch via BranchCategory. */
  branchId?: string;

  status?: CategoryStatus;

  page: number;

  pageSize: number;
}

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;

  meta?: CategoryListMeta;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message?: string;

  errors?: Record<
    string,
    string[]
  >;

  meta?: Record<
    string,
    string
  >;
}

export interface CategoryDeleteResponse {
  id: string;

  deleted: boolean;

  deletedAt: string;
}

export interface CategoryRestoreResponse
  extends Category {}

export interface CategoryPermanentDeleteResponse {
  id: string;

  permanentlyDeleted: boolean;
}

export interface ReorderCategoriesRequest {
  categoryId: string;
  newDisplayOrder: number;
}

export interface BulkCategoryItemResult {
  categoryId: string;
  success: boolean;
  message: string;
  status?: CategoryStatus;
}

export interface BulkCategoryOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkCategoryItemResult[];
  failures: BulkCategoryItemResult[];
}
