import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  AssignBatchTrainersRequest,
  AssignBatchCourseRequest,
  Batch,
  BatchCourseAssignment,
  BatchFilters,
  BatchListResponse,
  BatchSummary,
  BulkBatchOperationResult,
  CreateBatchRequest,
  DeleteBatchResponse,
  PermanentDeleteBatchResponse,
  ReorderBatchRequest,
  SuggestBatchCodeResponse,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";
import { buildBatchListQueryParams } from "@/src/features/batches/utils/batch-list.utils";

export const batchApi = {
  async getBatches(filters?: BatchFilters) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchListResponse>
    >("/admin/batches", {
      params: buildBatchListQueryParams(filters),
    });

    return response.data;
  },

  async getBatch(id: string) {
    const response = await apiClient.get<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}`,
    );

    return response.data;
  },

  async getBatchSummary(id: string) {
    const response = await apiClient.get<ApiSuccessResponse<BatchSummary>>(
      `/admin/batches/${id}/summary`,
    );

    return response.data;
  },

  async suggestBatchCode(startTime: string, endTime: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<SuggestBatchCodeResponse>
    >("/admin/batches/suggest-code", {
      params: { startTime, endTime },
    });

    return response.data;
  },

  async createBatch(payload: CreateBatchRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Batch>>(
      "/admin/batches",
      payload,
    );

    return response.data;
  },

  async updateBatch(id: string, payload: UpdateBatchRequest) {
    const response = await apiClient.patch<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}`,
      payload,
    );

    return response.data;
  },

  async assignTrainers(id: string, payload: AssignBatchTrainersRequest) {
    const response = await apiClient.patch<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}/assign-trainers`,
      payload,
    );

    return response.data;
  },

  async activateBatch(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}/activate`,
    );

    return response.data;
  },

  async deactivateBatch(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}/deactivate`,
    );

    return response.data;
  },

  async restoreBatch(id: string) {
    const response = await apiClient.patch<ApiSuccessResponse<Batch>>(
      `/admin/batches/${id}/restore`,
    );

    return response.data;
  },

  async deleteBatch(id: string) {
    const response = await apiClient.delete<ApiSuccessResponse<DeleteBatchResponse>>(
      `/admin/batches/${id}`,
    );

    return response.data;
  },

  async permanentlyDeleteBatch(id: string) {
    const response = await apiClient.delete<
      ApiSuccessResponse<PermanentDeleteBatchResponse>
    >(`/admin/batches/${id}/permanent`);

    return response.data;
  },

  async reorderBatches(payload: ReorderBatchRequest) {
    const response = await apiClient.patch<
      ApiSuccessResponse<{ batchId: string; displayOrder: number }>
    >("/admin/batches/reorder", payload);

    return response.data;
  },

  async bulkUpdateStatus(batchIds: string[], isActive: boolean) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk/status", { batchIds, isActive });

    return response.data;
  },

  async bulkActivate(batchIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk/activate", { batchIds });

    return response.data;
  },

  async bulkDeactivate(batchIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk/deactivate", { batchIds });

    return response.data;
  },

  async bulkDelete(batchIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk", { data: { batchIds } });

    return response.data;
  },

  async bulkRestore(batchIds: string[]) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk/restore", { batchIds });

    return response.data;
  },

  async bulkPermanentDelete(batchIds: string[]) {
    const response = await apiClient.delete<
      ApiSuccessResponse<BulkBatchOperationResult>
    >("/admin/batches/bulk/permanent", { data: { batchIds } });

    return response.data;
  },

  async getBatchCourses(batchId: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchCourseAssignment[]>
    >(`/admin/batches/${batchId}/courses`);

    return response.data;
  },

  async assignBatchCourse(
    batchId: string,
    payload: AssignBatchCourseRequest,
  ) {
    const response = await apiClient.post<
      ApiSuccessResponse<BatchCourseAssignment>
    >(`/admin/batches/${batchId}/courses`, payload);

    return response.data;
  },

  async removeBatchCourse(batchId: string, assignmentId: string) {
    const response = await apiClient.delete<ApiSuccessResponse<null>>(
      `/admin/batches/${batchId}/courses/${assignmentId}`,
    );

    return response.data;
  },
};
