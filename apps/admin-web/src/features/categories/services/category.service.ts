import { apiClient } from "@/src/core/api/axios";

import { categoryApi } from "@/src/features/categories/api/category.api";

import type {
  ApiSuccessResponse,
  CategoryDetails,
  CategoryListResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryFilters,
  CategoryDeleteResponse,
  CategoryRestoreResponse,
  CategoryPermanentDeleteResponse,
  ReorderCategoriesRequest,
  CategoryListMeta,
  BulkCategoryOperationResult,
  CategoryStatus,
} from "@/src/features/categories/types/category.types";

class CategoryService {
  private readonly basePath =
    "/admin/categories";

  async createCategory(
    payload: CreateCategoryRequest
  ): Promise<
    ApiSuccessResponse<CategoryDetails>
  > {
    const response =
      await apiClient.post<
        ApiSuccessResponse<CategoryDetails>
      >(this.basePath, payload);

    return response.data;
  }

  async getCategories(
    filters: CategoryFilters
  ): Promise<
    ApiSuccessResponse<CategoryListResponse> & {
      meta?: CategoryListMeta;
    }
  > {
    const skip =
      (filters.page - 1) *
      filters.pageSize;

    const response =
      await apiClient.get<
        ApiSuccessResponse<CategoryListResponse> & {
          meta?: CategoryListMeta;
        }
      >(this.basePath, {
        params: {
          search:
            filters.search ||
            undefined,

          status:
            filters.status ||
            undefined,

          branchId:
            filters.branchId ||
            undefined,

          includeDeleted: true,

          skip,

          take: filters.pageSize,
        },
      });

    return response.data;
  }

  async getCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CategoryDetails>
      >(`${this.basePath}/${id}`);

    return response.data;
  }

  async updateCategory(
    id: string,
    payload: UpdateCategoryRequest
  ): Promise<
    ApiSuccessResponse<CategoryDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<CategoryDetails>
      >(
        `${this.basePath}/${id}`,
        payload
      );

    return response.data;
  }

  async activateCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<CategoryDetails>
      >(
        `${this.basePath}/${id}/activate`
      );

    return response.data;
  }

  async deactivateCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<CategoryDetails>
      >(
        `${this.basePath}/${id}/deactivate`
      );

    return response.data;
  }

  async restoreCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryRestoreResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<CategoryRestoreResponse>
      >(
        `${this.basePath}/${id}/restore`
      );

    return response.data;
  }

  async deleteCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryDeleteResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<CategoryDeleteResponse>
      >(
        `${this.basePath}/${id}`
      );

    return response.data;
  }

  async permanentlyDeleteCategory(
    id: string
  ): Promise<
    ApiSuccessResponse<CategoryPermanentDeleteResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<CategoryPermanentDeleteResponse>
      >(
        `${this.basePath}/${id}/permanent`
      );

    return response.data;
  }

  async getCategoryDependencies(id: string): Promise<
    ApiSuccessResponse<{
      categoryId: string;
      categoryName: string;
      canDelete: boolean;
      removable: {
        branches: number;
        courses: number;
        enrollments: number;
        articles: number;
      };
      blocking: {
        branches: number;
        courses: number;
        enrollments: number;
        articles: number;
      };
    }>
  > {
    const response = await apiClient.get<
      ApiSuccessResponse<{
        categoryId: string;
        categoryName: string;
        canDelete: boolean;
        removable: {
          branches: number;
          courses: number;
          enrollments: number;
          articles: number;
        };
        blocking: {
          branches: number;
          courses: number;
          enrollments: number;
          articles: number;
        };
      }>
    >(`${this.basePath}/${id}/dependencies`);

    return response.data;
  }

  async reorderCategories(
    payload: ReorderCategoriesRequest
  ): Promise<
    ApiSuccessResponse<{
      categoryId: string;
      displayOrder: number;
    }>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<{
          categoryId: string;
          displayOrder: number;
        }>
      >(
        `${this.basePath}/reorder`,
        payload
      );

    return response.data;
  }

  async bulkUpdateStatus(
    categoryIds: string[],
    status: Exclude<CategoryStatus, "ARCHIVED">
  ): Promise<ApiSuccessResponse<BulkCategoryOperationResult>> {
    return categoryApi.bulkUpdateStatus(categoryIds, status);
  }

  async bulkDeleteCategories(
    categoryIds: string[]
  ): Promise<ApiSuccessResponse<BulkCategoryOperationResult>> {
    return categoryApi.bulkDeleteCategories(categoryIds);
  }

  async bulkRestoreCategories(
    categoryIds: string[]
  ): Promise<ApiSuccessResponse<BulkCategoryOperationResult>> {
    return categoryApi.bulkRestoreCategories(categoryIds);
  }

  async bulkPermanentDeleteCategories(
    categoryIds: string[]
  ): Promise<ApiSuccessResponse<BulkCategoryOperationResult>> {
    return categoryApi.bulkPermanentDeleteCategories(categoryIds);
  }

  async checkAvailability(params: {
    name?: string;
    slug?: string;
    excludeId?: string;
  }) {
    return categoryApi.checkAvailability(params);
  }

  async uploadCategoryImage(
    file: File
  ) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("folder", "categories");
    formData.append("fileName", file.name);

    const response = await apiClient.post(
      "/admin/uploads",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data) => data],
      }
    );

    return response.data;
  }
}

export const categoryService =
  new CategoryService();
