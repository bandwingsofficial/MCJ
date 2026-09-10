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
  BatchTimingDetailResponse,
  BatchTimingListResponse,
  BulkBatchOperationResult,
  CreateBatchRequest,
  CreateBatchWithTimingsRequest,
  DeleteBatchResponse,
  PermanentDeleteBatchResponse,
  ReorderBatchRequest,
  SuggestBatchCodeResponse,
  UpdateBatchRequest,
  UpdateBatchTimingRequest,
  BatchCalendarSummariesResponse,
  BatchCalendarViewResponse,
  UpsertBatchCalendarExceptionRequest,
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

  async suggestBatchCode(startDate: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<SuggestBatchCodeResponse>
    >("/admin/batches/suggest-code", {
      params: { startDate },
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

  /** Creates one batch that owns every selected timing as a child. */
  async createBatchWithTimings(payload: CreateBatchWithTimingsRequest) {
    const response = await apiClient.post<ApiSuccessResponse<Batch>>(
      "/admin/batches/with-timings",
      payload,
    );

    return response.data;
  },

  async getBatchTimings(batchId: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchTimingListResponse>
    >(`/admin/batches/${batchId}/timings`);

    return response.data;
  },

  async getBatchTiming(batchId: string, timingId: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchTimingDetailResponse>
    >(`/admin/batches/${batchId}/timings/${timingId}`);

    return response.data;
  },

  async updateBatchTiming(
    batchId: string,
    timingId: string,
    payload: UpdateBatchTimingRequest,
  ) {
    const response = await apiClient.patch<
      ApiSuccessResponse<BatchTimingDetailResponse>
    >(`/admin/batches/${batchId}/timings/${timingId}`, payload);

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

  async getBatchCalendarSummaries(batchId: string) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchCalendarSummariesResponse>
    >(`/admin/batches/${batchId}/calendar`);

    return response.data;
  },

  async getBatchCalendarView(
    batchId: string,
    mode: string,
    params?: { month?: string },
  ) {
    const response = await apiClient.get<
      ApiSuccessResponse<BatchCalendarViewResponse>
    >(`/admin/batches/${batchId}/calendar/${mode}`, { params });

    return response.data;
  },

  async getBatchCalendarWorkingDays(
    batchId: string,
    mode: string,
    params?: { from?: string; to?: string },
  ) {
    const response = await apiClient.get<
      ApiSuccessResponse<{ dateKeys: string[] }>
    >(`/admin/batches/${batchId}/calendar/${mode}/working-days`, { params });

    return response.data;
  },

  async upsertBatchCalendarException(
    batchId: string,
    mode: string,
    payload: UpsertBatchCalendarExceptionRequest,
  ) {
    const response = await apiClient.put<
      ApiSuccessResponse<{
        exception: UpsertBatchCalendarExceptionRequest;
        summary: BatchCalendarViewResponse["summary"];
        day: BatchCalendarViewResponse["days"][number] | undefined;
      }>
    >(`/admin/batches/${batchId}/calendar/${mode}/exceptions`, payload);

    return response.data;
  },

  async deleteBatchCalendarException(
    batchId: string,
    mode: string,
    date: string,
  ) {
    const response = await apiClient.delete<
      ApiSuccessResponse<{
        dateKey: string;
        summary: BatchCalendarViewResponse["summary"];
        day: BatchCalendarViewResponse["days"][number] | undefined;
      }>
    >(`/admin/batches/${batchId}/calendar/${mode}/exceptions/${date}`);

    return response.data;
  },
};
