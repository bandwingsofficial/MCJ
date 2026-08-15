import { AxiosError } from "axios";

import { apiClient } from "@/src/core/api/axios";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type {
  ApiSuccessResponse,
  BulkTrainerOperationResult,
  CreateTrainerRequest,
  SuggestTrainerCodeResponse,
  TrainerDeleteResponse,
  TrainerDetails,
  TrainerFilters,
  TrainerListItem,
  TrainerListResponse,
  TrainerPermanentDeleteResponse,
  UpdateTrainerRequest,
} from "@/src/features/trainers/types/trainer.types";

const DEFAULT_PAGE_SIZE = 20;

function normalizeListResponse(
  data: TrainerListResponse | TrainerListItem[]
): TrainerListResponse {
  if (Array.isArray(data)) {
    return {
      items: data,
      count: data.length,
    };
  }

  return {
    items: data.items ?? [],
    count:
      data.meta?.total ??
      data.count ??
      data.items?.length ??
      0,
    meta: data.meta,
  };
}

class TrainerService {
  private readonly basePath = "/admin/trainers";

  async getTrainers(filters?: TrainerFilters) {
    try {
      const page = filters?.page ?? 1;
      const pageSize = filters?.pageSize ?? DEFAULT_PAGE_SIZE;
      const skip = (page - 1) * pageSize;

      const response = await apiClient.get<
        ApiSuccessResponse<
          TrainerListResponse | TrainerListItem[]
        >
      >(this.basePath, {
        params: {
          search: filters?.search?.trim() || undefined,
          branchId: filters?.branchId || undefined,
          trainerType: filters?.trainerType || undefined,
          status: filters?.status || undefined,
          includeDeleted:
            filters?.status != null ? undefined : false,
          skip,
          take: pageSize,
        },
      });

      return {
        ...response.data,
        data: normalizeListResponse(response.data.data),
      };
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getTrainer(id: string) {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<TrainerDetails>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async suggestTrainerCode() {
    try {
      const response = await apiClient.get<
        ApiSuccessResponse<SuggestTrainerCodeResponse>
      >(`${this.basePath}/suggest-code`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createTrainer(payload: CreateTrainerRequest) {
    try {
      const response = await apiClient.post<
        ApiSuccessResponse<TrainerDetails>
      >(this.basePath, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async updateTrainer(
    id: string,
    payload: UpdateTrainerRequest
  ) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(`${this.basePath}/${id}`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async activateTrainer(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(`${this.basePath}/${id}/activate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deactivateTrainer(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(`${this.basePath}/${id}/deactivate`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async restoreTrainer(id: string) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(`${this.basePath}/${id}/restore`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteTrainer(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<TrainerDeleteResponse>
      >(`${this.basePath}/${id}`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async permanentDeleteTrainer(id: string) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<TrainerPermanentDeleteResponse>
      >(`${this.basePath}/${id}/permanent`);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async reorderTrainers(payload: {
    trainerId: string;
    newDisplayOrder: number;
  }) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<{
          trainerId: string;
          displayOrder: number;
        }>
      >(`${this.basePath}/reorder`, payload);

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkActivate(trainerIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkTrainerOperationResult>
      >(`${this.basePath}/bulk/status`, {
        trainerIds,
        status: "ACTIVE",
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDeactivate(trainerIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkTrainerOperationResult>
      >(`${this.basePath}/bulk/status`, {
        trainerIds,
        status: "INACTIVE",
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkDelete(trainerIds: string[]) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<BulkTrainerOperationResult>
      >(`${this.basePath}/bulk`, {
        data: { trainerIds },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkRestore(trainerIds: string[]) {
    try {
      const response = await apiClient.patch<
        ApiSuccessResponse<BulkTrainerOperationResult>
      >(`${this.basePath}/bulk/restore`, {
        trainerIds,
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async bulkPermanentDelete(trainerIds: string[]) {
    try {
      const response = await apiClient.delete<
        ApiSuccessResponse<BulkTrainerOperationResult>
      >(`${this.basePath}/bulk/permanent`, {
        data: { trainerIds },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async uploadTrainerImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "trainers");
    formData.append("fileName", file.name);

    const response = await apiClient.post(
      "/admin/uploads",
      formData,
      {
        headers: {
          "Content-Type": undefined,
        },
        transformRequest: [(data) => data],
      }
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
        : "Unexpected error occurred"
    );
  }
}

export const trainerService = new TrainerService();
