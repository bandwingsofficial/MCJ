import { apiClient } from "@/src/core/api/axios";

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
    ApiSuccessResponse<CategoryListResponse>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<CategoryListResponse>
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

          includeDeleted:
            filters.includeDeleted,
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
}

export const categoryService =
  new CategoryService();