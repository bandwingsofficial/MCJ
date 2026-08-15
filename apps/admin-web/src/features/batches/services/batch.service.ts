// src/features/batches/services/batch.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  TrainerListItem,
  TrainerListResponse as TrainerListPayload,
} from "@/src/features/trainers/types/trainer.types";

import type {
  BatchListResponse,
  BatchResponse,
  BranchListResponse,
  CourseListResponse,
  CreateBatchRequest,
  DeleteBatchResponse,
  PermanentDeleteBatchResponse,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";

class BatchService {
  async getBatches(filters?: {
    search?: string;
    courseId?: string;
    branchId?: string;
    includeDeleted?: boolean;
    skip?: number;
    take?: number;
  }) {
    const { data } =
      await apiClient.get<BatchListResponse>(
        "/admin/batches",
        {
          params: {
            search: filters?.search || undefined,
            courseId: filters?.courseId || undefined,
            branchId: filters?.branchId || undefined,
            includeDeleted: filters?.includeDeleted ?? false,
            skip: filters?.skip,
            take: filters?.take,
          },
        },
      );

    return data;
  }

  async getBatch(id: string) {
    const { data } =
      await apiClient.get<BatchResponse>(
        `/admin/batches/${id}`,
      );

    return data;
  }

  async createBatch(
    payload: CreateBatchRequest,
  ) {
    const { data } =
      await apiClient.post<BatchResponse>(
        "/admin/batches",
        payload,
      );

    return data;
  }

  async updateBatch(
    id: string,
    payload: UpdateBatchRequest,
  ) {
    const { data } =
      await apiClient.patch<BatchResponse>(
        `/admin/batches/${id}`,
        payload,
      );

    return data;
  }

  async activateBatch(id: string) {
    const { data } =
      await apiClient.patch<BatchResponse>(
        `/admin/batches/${id}/activate`,
      );

    return data;
  }

  async deactivateBatch(id: string) {
    const { data } =
      await apiClient.patch<BatchResponse>(
        `/admin/batches/${id}/deactivate`,
      );

    return data;
  }

  async restoreBatch(id: string) {
    const { data } =
      await apiClient.patch<BatchResponse>(
        `/admin/batches/${id}/restore`,
      );

    return data;
  }

  async deleteBatch(id: string) {
    const { data } =
      await apiClient.delete<DeleteBatchResponse>(
        `/admin/batches/${id}`,
      );

    return data;
  }

  async permanentlyDeleteBatch(
    id: string,
  ) {
    const { data } =
      await apiClient.delete<PermanentDeleteBatchResponse>(
        `/admin/batches/${id}/permanent`,
      );

    return data;
  }

  async getCourses() {
  const { data } =
    await apiClient.get<CourseListResponse>(
      "/admin/courses",
    );

  return data.data;
}

async getBranches() {
  const { data } =
    await apiClient.get<BranchListResponse>(
      "/admin/branches?status=ACTIVE",
    );

  return data.data.items;
}

async getTrainers(): Promise<TrainerListItem[]> {
  const { data } = await apiClient.get<{
    data: TrainerListPayload | TrainerListItem[];
  }>("/admin/trainers");

  const payload = data.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  return payload.items ?? [];
}
}

export const batchService =
  new BatchService();
