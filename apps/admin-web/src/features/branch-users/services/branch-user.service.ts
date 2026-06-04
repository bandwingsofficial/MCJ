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
    const response =
      await apiClient.get<
        ApiSuccessResponse<BranchUserListResponse>
      >(this.basePath, {
        params: {
  includeDeleted:
    filters.includeDeleted,
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
  console.log(
    "RESET PASSWORD URL",
    `${this.basePath}/${id}/reset-password`
  );

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
}

export const branchUserService =
  new BranchUserService();