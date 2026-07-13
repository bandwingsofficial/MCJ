// src/features/trainers/services/trainer.service.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  ApiSuccessResponse,
  CreateTrainerRequest,
  TrainerDeleteResponse,
  TrainerDetails,
  TrainerListItem,
  TrainerPermanentDeleteResponse,
  TrainerFilters,
  UpdateTrainerRequest,
} from "@/src/features/trainers/types/trainer.types";

class TrainerService {
  private readonly basePath =
    "/admin/trainers";

  async createTrainer(
    payload: CreateTrainerRequest
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.post<
        ApiSuccessResponse<TrainerDetails>
      >(this.basePath, payload);

    return response.data;
  }

  async getTrainers(
    filters: TrainerFilters
  ): Promise<
    ApiSuccessResponse<
      TrainerListItem[]
    >
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<
          TrainerListItem[]
        >
      >(this.basePath, {
        params: {
          search:
            filters.search ||
            undefined,

          branchId:
            filters.branchId ||
            undefined,

          trainerType:
            filters.trainerType ||
            undefined,

          status:
            filters.status ||
            undefined,

          includeDeleted:
            filters.includeDeleted,

          skip: filters.skip,

          take: filters.take,
        },
      });

    return response.data;
  }

  async getTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.get<
        ApiSuccessResponse<TrainerDetails>
      >(
        `${this.basePath}/${id}`
      );

    return response.data;
  }

  async updateTrainer(
    id: string,
    payload: UpdateTrainerRequest
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(
        `${this.basePath}/${id}`,
        payload
      );

    return response.data;
  }

  async activateTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(
        `${this.basePath}/${id}/activate`
      );

    return response.data;
  }

  async deactivateTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(
        `${this.basePath}/${id}/deactivate`
      );

    return response.data;
  }

  async restoreTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerDetails>
  > {
    const response =
      await apiClient.patch<
        ApiSuccessResponse<TrainerDetails>
      >(
        `${this.basePath}/${id}/restore`
      );

    return response.data;
  }

  async deleteTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerDeleteResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<TrainerDeleteResponse>
      >(
        `${this.basePath}/${id}`
      );

    return response.data;
  }

  async permanentDeleteTrainer(
    id: string
  ): Promise<
    ApiSuccessResponse<TrainerPermanentDeleteResponse>
  > {
    const response =
      await apiClient.delete<
        ApiSuccessResponse<TrainerPermanentDeleteResponse>
      >(
        `${this.basePath}/${id}/permanent`
      );

    return response.data;
  }
  async uploadTrainerImage(
  file: File
){const formData =
  new FormData();

formData.append(
  "file",
  file
);

formData.append(
  "folder",
  "trainers"
);

formData.append(
  "fileName",
  file.name
);

const response =
  await apiClient.post(
    "/admin/uploads",
    formData,
    {
      headers: {
        "Content-Type":
          undefined,
      },
      transformRequest: [
        (data) => data,
      ],
    }
  );

return response.data;
}
}

export const trainerService =
  new TrainerService();