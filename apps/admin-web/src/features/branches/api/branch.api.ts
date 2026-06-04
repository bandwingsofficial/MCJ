import { apiClient } from "@/src/core/api/axios";

import {
  ApiResponse,
  Branch,
  BranchFilters,
  BranchListResponse,
  CreateBranchRequest,
  UpdateBranchRequest,
  UpdateBranchStatusRequest,
} from "@/src/features/branches/types/branch.types";

export const branchApi = {
  async getBranches(
    filters?: BranchFilters
  ) {
    const response =
      await apiClient.get<
        ApiResponse<BranchListResponse>
      >("/admin/branches", {
        params: filters,
      });

    return response.data;
  },

  async getBranch(
    id: string
  ) {
    const response =
      await apiClient.get<
        ApiResponse<Branch>
      >(`/admin/branches/${id}`);

    return response.data;
  },

  async createBranch(
    payload: CreateBranchRequest
  ) {
    const response =
      await apiClient.post<
        ApiResponse<Branch>
      >(
        "/admin/branches",
        payload
      );

    return response.data;
  },

  async updateBranch(
    id: string,
    payload: UpdateBranchRequest
  ) {
    const response =
      await apiClient.patch<
        ApiResponse<Branch>
      >(
        `/admin/branches/${id}`,
        payload
      );

    return response.data;
  },

  async updateStatus(
    id: string,
    payload:
      UpdateBranchStatusRequest
  ) {
    const response =
      await apiClient.patch(
        `/admin/branches/${id}/status`,
        payload
      );

    return response.data;
  },

  async deleteBranch(
    id: string
  ) {
    const response =
      await apiClient.delete(
        `/admin/branches/${id}`
      );

    return response.data;
  },

  async restoreBranch(
    id: string
  ) {
    const response =
      await apiClient.patch(
        `/admin/branches/${id}/restore`
      );

    return response.data;
  },

  async deletePermanentlyBranch(
  id: string
) {
  const response =
    await apiClient.delete<
      ApiResponse<null>
    >(
      `/admin/branches/${id}`
    );

  return response.data;
}
};