import { apiClient } from "@/src/core/api/axios";

import {
  ApiResponse,
  Branch,
  BranchFilters,
  BranchListResponse,
  CheckBranchAvailabilityResponse,
  CreateBranchRequest,
  SuggestBranchCodeResponse,
  UpdateBranchRequest,
  UpdateBranchStatusRequest,
} from "@/src/features/branches/types/branch.types";

export const branchApi = {
  async getBranches(filters?: BranchFilters) {
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const response = await apiClient.get<
      ApiResponse<BranchListResponse>
    >("/admin/branches", {
      params: {
        search: filters?.search || undefined,
        status: filters?.status || undefined,
        includeDeleted:
          filters?.status != null
            ? undefined
            : (filters?.includeDeleted ?? true),
        skip,
        take: pageSize,
      },
    });

    return response.data;
  },

  async getBranch(id: string) {
    const response = await apiClient.get<
      ApiResponse<Branch>
    >(`/admin/branches/${id}`);

    return response.data;
  },

  async suggestBranchCode(branchName: string) {
    const response = await apiClient.get<
      ApiResponse<SuggestBranchCodeResponse>
    >("/admin/branches/suggest-code", {
      params: { branchName },
    });

    return response.data;
  },

  async checkAvailability(params: {
    branchCode?: string;
    branchName?: string;
    excludeId?: string;
  }) {
    const response = await apiClient.get<
      ApiResponse<CheckBranchAvailabilityResponse>
    >("/admin/branches/check-availability", {
      params,
    });

    return response.data;
  },

  async createBranch(payload: CreateBranchRequest) {
    const response = await apiClient.post<
      ApiResponse<Branch>
    >("/admin/branches", payload);

    return response.data;
  },

  async updateBranch(
    id: string,
    payload: UpdateBranchRequest
  ) {
    const response = await apiClient.patch<
      ApiResponse<Branch>
    >(`/admin/branches/${id}`, payload);

    return response.data;
  },

  async updateStatus(
    id: string,
    payload: UpdateBranchStatusRequest
  ) {
    const response = await apiClient.patch(
      `/admin/branches/${id}/status`,
      payload
    );

    return response.data;
  },

  async deleteBranch(id: string) {
    const response = await apiClient.delete(
      `/admin/branches/${id}`
    );

    return response.data;
  },

  async permanentDeleteBranch(id: string) {
    const response = await apiClient.delete(
      `/admin/branches/${id}/permanent`
    );

    return response.data;
  },

  async getBranchSummary(id: string) {
    const response = await apiClient.get<
      ApiResponse<{
        branchId: string;
        students: number;
        courses: number;
        batches: number;
        enrollments: number;
        instructors: number;
        categories: number;
      }>
    >(`/admin/branches/${id}/summary`);

    return response.data;
  },

  async restoreBranch(id: string) {
    const response = await apiClient.patch(
      `/admin/branches/${id}/restore`
    );

    return response.data;
  },

  async reorderBranches(payload: {
    branchId: string;
    newDisplayOrder: number;
  }) {
    const response = await apiClient.patch<
      ApiResponse<{
        branchId: string;
        displayOrder: number;
      }>
    >("/admin/branches/reorder", payload);

    return response.data;
  },
};
