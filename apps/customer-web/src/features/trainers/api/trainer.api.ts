import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export interface TrainerListResult {
  items: Trainer[];
  total: number;
}

export interface TrainerFilters {
  branchId?: string;
  courseId?: string;
  search?: string;
  isFeatured?: boolean;
  skip?: number;
  take?: number;
}

export const trainerApi = {
  getTrainers(filters?: TrainerFilters) {
    return apiClient.get<
      ApiResponse<TrainerListResult>
    >("/trainers", {
      params: filters,
    });
  },

  getTrainer(
    id: string,
  ) {
    return apiClient.get<
      ApiResponse<Trainer>
    >(`/trainers/${id}`);
  },
};