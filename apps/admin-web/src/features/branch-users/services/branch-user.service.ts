// src/features/branch-users/services/branch-user.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  ActivateBranchUserResponse,
  ApiSuccessResponse,
  BranchUserDetails,
  BranchUserListResponse,
  CreateBranchUserRequest,
  DeactivateBranchUserResponse,
  RestoreBranchUserResponse,
  UpdateBranchUserRequest,
  BranchUserFilters,
} from "@/src/features/branch-users/types/branch-user.types";

class BranchUserService {
  private readonly basePath =
    "/admin/branch-users";

  async createBranchUser(
    payload: CreateBranchUserRequest
  ): Promise<
    ApiSuccessResponse<BranchUserDetails>
  > {
    const response =
      await apiClient.post<
        ApiSuccessResponse<BranchUserDetails>
      >(this.basePath, payload);

    return response.data;
  }

  async getBranchUsers(
    filters: BranchUserFilters
  ): Promise<
    ApiSuccessResponse<BranchUserListResponse>
  > {
    const pageSize = Math.min(filters.pageSize, 100);
    const skip =
      (filters.page - 1) * pageSize;

    const statusParams = (() => {
      if (!filters.status) {
        return {
          includeDeleted: true,
        };
      }

      if (filters.status === "ACTIVE") {
        return {
          isActive: true,
          isDeleted: false,
        };
      }

      if (filters.status === "INACTIVE") {
        return {
          isActive: false,
          isDeleted: false,
        };
      }

      return {
        isDeleted: true,
      };
    })();

    const response =
      await apiClient.get<
        ApiSuccessResponse<BranchUserListResponse>
      >(this.basePath, {
        params: {
          branchId: filters.branchId || undefined,
          search: filters.search.trim() || undefined,
          role: filters.role || undefined,
          ...statusParams,
          skip,
          take: pageSize,
        },
      });

    return response.data;
  }

  async getBranchUser(
    id: string
  ): Promise<
    ApiSuccessResponse<BranchUserDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<BranchUserDetails>
      >(`${this.basePath}/${id}`);

    return response.data;
  }

  async updateBranchUser(
    id: string,
    payload: UpdateBranchUserRequest
  ): Promise<
    ApiSuccessResponse<BranchUserDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<BranchUserDetails>
      >(
        `${this.basePath}/${id}`,
        payload
      );

    return response.data;
  }

  async activateBranchUser(
    id: string
  ): Promise<
    ApiSuccessResponse<ActivateBranchUserResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<ActivateBranchUserResponse>
      >(
        `${this.basePath}/${id}/activate`
      );

    return response.data;
  }

  async deactivateBranchUser(
    id: string
  ): Promise<
    ApiSuccessResponse<DeactivateBranchUserResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<DeactivateBranchUserResponse>
      >(
        `${this.basePath}/${id}/deactivate`
      );

    return response.data;
  }

  async restoreBranchUser(
    id: string
  ): Promise<
    ApiSuccessResponse<RestoreBranchUserResponse>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<RestoreBranchUserResponse>
      >(
        `${this.basePath}/${id}/restore`
      );

    return response.data;
  }

  async resetPassword(
    id: string,
    newPassword: string
  ): Promise<void> {
    await apiClient.patch(
      `${this.basePath}/${id}/reset-password`,
      {
        newPassword,
      }
    );
  }

  async deleteBranchUser(
    id: string
  ): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${id}`
    );
  }

  async permanentlyDeleteBranchUser(
    id: string
  ): Promise<void> {
    await apiClient.delete(
      `${this.basePath}/${id}/permanent`
    );
  }
}

export const branchUserService =
  new BranchUserService();
