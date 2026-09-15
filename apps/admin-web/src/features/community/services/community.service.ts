import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { COMMUNITY_UPLOAD_FOLDER } from "@/src/features/community/constants/community.constants";

import type {
  ApiSuccessResponse,
  BulkCommunityItemResult,
  BulkCommunityOperationResult,
  CommunityDeleteResponse,
  CommunityFilters,
  CommunityListMeta,
  CommunityPermanentDeleteResponse,
  CommunityPostDetails,
  CommunityPostLike,
  CommunityPostListItem,
  CreateCommunityPostRequest,
  UpdateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

const DEFAULT_PAGE_SIZE = 20;

export function resolveCommunityListTotal(
  response: ApiSuccessResponse<CommunityPostListItem[]> & {
    meta?: CommunityListMeta;
  },
): number {
  if (typeof response.meta?.total === "number") {
    return response.meta.total;
  }

  return response.data.length;
}

class CommunityService {
  private readonly basePath = "/admin/community-posts";

  async getCommunityPostsList(filters?: CommunityFilters) {
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
        type: filters?.type || undefined,
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
        ApiSuccessResponse<CommunityPostListItem[]> & {
          meta?: CommunityListMeta;
        }
      >(this.basePath, { params });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getCommunityPost(id: string) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<CommunityPostDetails>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getPostLikes(
    postId: string,
    options?: { skip?: number; take?: number },
  ) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<CommunityPostLike[]> & {
          meta?: { total: number; skip?: number; take?: number };
        }
      >(`${this.basePath}/${postId}/likes`, {
        params: {
          skip: options?.skip,
          take: options?.take,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createCommunityPost(payload: CreateCommunityPostRequest) {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<CommunityPostDetails>
      >(this.basePath, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateCommunityPost(
    id: string,
    payload: UpdateCommunityPostRequest,
  ) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<CommunityPostDetails>
      >(`${this.basePath}/${id}`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateCommunityPost(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<CommunityPostDetails>
      >(`${this.basePath}/${id}/activate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateCommunityPost(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<CommunityPostDetails>
      >(`${this.basePath}/${id}/deactivate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreCommunityPost(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<CommunityPostDetails>
      >(`${this.basePath}/${id}/restore`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteCommunityPost(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<CommunityDeleteResponse>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteCommunityPost(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<CommunityPermanentDeleteResponse>
      >(`${this.basePath}/${id}/permanent`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private async runBulkOperation(
    ids: string[],
    operation: (id: string) => Promise<unknown>,
  ): Promise<BulkCommunityOperationResult> {
    const results = await Promise.all(
      ids.map(async (id): Promise<BulkCommunityItemResult> => {
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
      this.activateCommunityPost(id),
    );
  }

  async bulkDeactivate(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.deactivateCommunityPost(id),
    );
  }

  async bulkDelete(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.deleteCommunityPost(id),
    );
  }

  async bulkRestore(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.restoreCommunityPost(id),
    );
  }

  async bulkPermanentDelete(ids: string[]) {
    return this.runBulkOperation(ids, (id) =>
      this.permanentDeleteCommunityPost(id),
    );
  }

  async uploadMedia(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", COMMUNITY_UPLOAD_FOLDER);
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

  async blockComment(id: string) {
    try {
      const response = await apiClient.patch(
        `/admin/community-comments/${id}/block`,
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async unblockComment(id: string) {
    try {
      const response = await apiClient.patch(
        `/admin/community-comments/${id}/unblock`,
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteComment(id: string) {
    try {
      const response = await apiClient.delete(
        `/admin/community-comments/${id}`,
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreComment(id: string) {
    try {
      const response = await apiClient.patch(
        `/admin/community-comments/${id}/restore`,
      );

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
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

export const communityService = new CommunityService();
