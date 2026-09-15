import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { FINANCE_NEWS_UPLOAD_FOLDER } from "@/src/features/finance-news/constants/finance-news.constants";

import type {
  ApiSuccessResponse,
  BulkFinanceNewsItemResult,
  BulkFinanceNewsOperationResult,
  CreateFinanceNewsRequest,
  FinanceNewsDeleteResponse,
  FinanceNewsDetails,
  FinanceNewsFilters,
  FinanceNewsListItem,
  FinanceNewsListMeta,
  FinanceNewsPermanentDeleteResponse,
  UpdateFinanceNewsRequest,
} from "@/src/features/finance-news/types/finance-news.types";

const DEFAULT_PAGE_SIZE = 20;

/** Reads the authoritative total from list API pagination metadata. */
export function resolveFinanceNewsListTotal(
  response: ApiSuccessResponse<FinanceNewsListItem[]> & {
    meta?: FinanceNewsListMeta;
  },
): number {
  if (typeof response.meta?.total === "number") {
    return response.meta.total;
  }

  return response.data.length;
}

class FinanceNewsService {
  private readonly basePath = "/admin/financial-articles";

  async getFinanceNewsList(filters?: FinanceNewsFilters) {
    try {
      const page = filters?.page ?? 1;
      const pageSize = Math.min(
        filters?.pageSize ?? DEFAULT_PAGE_SIZE,
        100,
      );
      const skip = (page - 1) * pageSize;
      const status = filters?.status;

      const params: Record<string, unknown> = {
        search: filters?.search?.trim() || undefined,
        categoryId: filters?.categoryId || undefined,
        includeDeleted: filters?.includeDeleted ?? true,
        skip,
        take: pageSize,
      };

      if (filters?.isDeleted !== undefined) {
        params.isDeleted = filters.isDeleted;
      } else if (filters?.isActive !== undefined) {
        params.isDeleted = false;
        params.isActive = filters.isActive;
      } else if (status === "ACTIVE") {
        params.isDeleted = false;
        params.isActive = true;
      } else if (status === "INACTIVE") {
        params.isDeleted = false;
        params.isActive = false;
      } else if (status === "ARCHIVED") {
        params.isDeleted = true;
      }

      const response = await apiClient.get<
        ApiSuccessResponse<FinanceNewsListItem[]> & {
          meta?: FinanceNewsListMeta;
        }
      >(this.basePath, { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getFinanceNews(id: string) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createFinanceNews(payload: CreateFinanceNewsRequest) {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<FinanceNewsDetails>
      >(this.basePath, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateFinanceNews(
    id: string,
    payload: UpdateFinanceNewsRequest,
  ) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${id}`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateFinanceNews(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${id}/activate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateFinanceNews(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${id}/deactivate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreFinanceNews(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${id}/restore`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteFinanceNews(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<FinanceNewsDeleteResponse>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteFinanceNews(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<FinanceNewsPermanentDeleteResponse>
      >(`${this.basePath}/${id}/permanent`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async moveFinanceNews(payload: {
    id: string;
    newPosition: number;
  }) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<FinanceNewsDetails>
      >(`${this.basePath}/${payload.id}/move`, {
        newPosition: payload.newPosition,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async runBulkOperation(
    ids: string[],
    operation: (id: string) => Promise<unknown>,
  ): Promise<BulkFinanceNewsOperationResult> {
    const results = await Promise.all(
      ids.map(async (id): Promise<BulkFinanceNewsItemResult> => {
        try {
          await operation(id);
          return { id, success: true, message: "OK" };
        } catch (error) {
          return {
            id,
            success: false,
            message:
              error instanceof Error
                ? error.message
                : "Operation failed",
          };
        }
      }),
    );

    const failures = results.filter((item) => !item.success);

    return {
      requestedCount: ids.length,
      processedCount: results.length,
      successCount: results.length - failures.length,
      failedCount: failures.length,
      results,
      failures,
    };
  }

  async bulkActivate(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.activateFinanceNews(id),
    );
  }

  async bulkDeactivate(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.deactivateFinanceNews(id),
    );
  }

  async bulkDelete(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.deleteFinanceNews(id),
    );
  }

  async bulkRestore(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.restoreFinanceNews(id),
    );
  }

  async bulkPermanentDelete(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.permanentDeleteFinanceNews(id),
    );
  }

  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", FINANCE_NEWS_UPLOAD_FOLDER);
    formData.append("fileName", file.name);

    const response = await apiClient.post(
      "/admin/uploads",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data) => data],
      },
    );

    return response.data;
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      return new Error(getErrorMessage(error));
    }

    return new Error(
      error instanceof Error
        ? error.message
        : "Unexpected error occurred",
    );
  }
}

export const financeNewsService = new FinanceNewsService();
