import type {
  BulkCategoryOperationResult,
  CategoryStatus,
} from "@/src/features/categories/types/category.types";

import { apiClient } from "@/src/core/api/axios";

import type { ApiSuccessResponse } from "@/src/features/categories/types/category.types";

export const categoryApi = {
  all: ["categories"] as const,

  list: (filters: {
    search?: string;
    status?: string;
    page?: number;
    pageSize?: number;
  }) =>
    [
      ...categoryApi.all,
      "list",
      filters.search ?? "",
      filters.status ?? "ALL",
      filters.page ?? 1,
      filters.pageSize ?? 20,
    ] as const,

  detail: (id: string) =>
    [
      ...categoryApi.all,
      "detail",
      id,
    ] as const,

  async bulkUpdateStatus(
    categoryIds: string[],
    status: Exclude<CategoryStatus, "ARCHIVED">
  ) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkCategoryOperationResult>
    >("/admin/categories/bulk/status", {
      categoryIds,
      status,
    });

    return response.data;
  },

  async bulkDeleteCategories(categoryIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkCategoryOperationResult>
    >("/admin/categories/bulk", {
      data: { categoryIds },
    });

    return response.data;
  },

  async bulkRestoreCategories(categoryIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkCategoryOperationResult>
    >("/admin/categories/bulk/restore", {
      categoryIds,
    });

    return response.data;
  },

  async bulkPermanentDeleteCategories(categoryIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkCategoryOperationResult>
    >("/admin/categories/bulk/permanent", {
      data: { categoryIds },
    });

    return response.data;
  },

  async checkAvailability(params: {
    name?: string;
    slug?: string;
    excludeId?: string;
  }) {
    const response = await apiClient.get<
      ApiSuccessResponse<{
        nameAvailable: boolean | null;
        slugAvailable: boolean | null;
        nameMessage: string | null;
        slugMessage: string | null;
      }>
    >("/admin/categories/check-availability", {
      params,
    });

    return response.data;
  },
};
