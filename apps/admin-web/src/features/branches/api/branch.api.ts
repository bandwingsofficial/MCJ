import { apiClient } from "@/src/core/api/axios";

import {
  ApiResponse,
  Branch,
  BranchFilters,
  BranchListResponse,
  BulkBranchOperationResult,
  CheckBranchAvailabilityResponse,
  CreateBranchRequest,
  SuggestBranchCodeResponse,
  UpdateBranchRequest,
  UpdateBranchStatusRequest,
} from "@/src/features/branches/types/branch.types";

const MAX_BRANCH_PAGE_SIZE = 100;

export const branchApi = {
  async getBranches(filters?: BranchFilters) {
    const page = filters?.page ?? 1;
    const pageSize = Math.min(
      filters?.pageSize ?? 20,
      MAX_BRANCH_PAGE_SIZE,
    );
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

  async suggestBranchCode(branchName?: string) {
    const response = await apiClient.get<
      ApiResponse<SuggestBranchCodeResponse>
    >("/admin/branches/suggest-code", {
      params: branchName ? { branchName } : undefined,
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

  async assignCategories(
    branchId: string,
    categoryIds: string[]
  ) {
    const response = await apiClient.post<
      ApiResponse<{
        branchId: string;
        assignedCount: number;
        categoryIds: string[];
      }>
    >(`/admin/branches/${branchId}/categories/assign`, {
      categoryIds,
    });

    return response.data;
  },

  async unassignCategory(
    branchId: string,
    categoryId: string
  ) {
    const response = await apiClient.delete<
      ApiResponse<{
        branchId: string;
        categoryId: string;
        unassigned: boolean;
      }>
    >(`/admin/branches/${branchId}/categories/${categoryId}`);

    return response.data;
  },

  async assignCourses(
    branchId: string,
    courseIds: string[]
  ) {
    const response = await apiClient.post<
      ApiResponse<{
        branchId: string;
        assignedCount: number;
        courseIds: string[];
      }>
    >(`/admin/branches/${branchId}/courses/assign`, {
      courseIds,
    });

    return response.data;
  },

  async unassignCourse(
    branchId: string,
    courseId: string
  ) {
    const response = await apiClient.delete<
      ApiResponse<{
        branchId: string;
        courseId: string;
        unassigned: boolean;
      }>
    >(`/admin/branches/${branchId}/courses/${courseId}`);

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

  async bulkUpdateStatus(
    branchIds: string[],
    status: "ACTIVE" | "INACTIVE"
  ) {
    const response = await apiClient.patch<
      ApiResponse<BulkBranchOperationResult>
    >("/admin/branches/bulk/status", {
      branchIds,
      status,
    });

    return response.data;
  },

  async bulkDeleteBranches(branchIds: string[]) {
    const response = await apiClient.delete<
      ApiResponse<BulkBranchOperationResult>
    >("/admin/branches/bulk", {
      data: { branchIds },
    });

    return response.data;
  },

  async bulkRestoreBranches(branchIds: string[]) {
    const response = await apiClient.patch<
      ApiResponse<BulkBranchOperationResult>
    >("/admin/branches/bulk/restore", {
      branchIds,
    });

    return response.data;
  },

  async bulkPermanentDeleteBranches(branchIds: string[]) {
    const response = await apiClient.delete<
      ApiResponse<BulkBranchOperationResult>
    >("/admin/branches/bulk/permanent", {
      data: { branchIds },
    });

    return response.data;
  },
};
