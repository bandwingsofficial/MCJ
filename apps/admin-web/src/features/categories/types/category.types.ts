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

  displayOrder: number;

  branchId: string | null;

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

  displayOrder?: number;

  branchId?: string;

  status?: Exclude<CategoryStatus, "ARCHIVED">;

  thumbnailFileId?: string;
}

export interface UpdateCategoryRequest {
  name?: string;

  description?: string;

  displayOrder?: number;

  branchId?: string;

  status?: Exclude<CategoryStatus, "ARCHIVED">;

  thumbnailFileId?: string;
}

export interface CategoryListItem {
  id: string;

  name: string;

  slug: string;

  description: string | null;

  status: CategoryStatus;

  displayOrder: number;

  branchId: string | null;

  isDeleted: boolean;

  createdAt: string;

  updatedAt: string;

  thumbnailUrl: string;
}

export type CategoryListResponse =
  CategoryListItem[];

export interface CategoryFilters {
  search: string;

  includeDeleted: boolean;

  branchId?: string;

  status?:
    | "ACTIVE"
    | "INACTIVE";
}

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;
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