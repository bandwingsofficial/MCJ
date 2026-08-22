// src/features/categories/types/category.types.ts

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailFileId: string | null;
  thumbnailUrl: string | null;
  status: CategoryStatus;
  displayOrder: number;
  branchId: string;
  createdBy: string;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  courseCount?: number;
}

export type CategoryStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  status: CategoryStatus;
  displayOrder: number;
  branchId: string;
  courseCount?: number;
}

export interface GetCategoriesParams {
  search?: string;
  branchId?: string;
}

export interface GetCategoriesResponse {
  success: boolean;
  message: string;
  data: CategoryDto[];
}