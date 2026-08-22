import { apiClient } from "@/src/core/api/axios";

import type { ApiResponse } from "@/src/core/types/api-response.types";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export interface TrainerListResult {
  items: Trainer[];
  total: number;
}

export const trainerApi = {
  getTrainers() {
    return apiClient.get<
      ApiResponse<TrainerListResult>
    >("/trainers");
  },

  getTrainer(
    id: string,
  ) {
    return apiClient.get<
      ApiResponse<Trainer>
    >(`/trainers/${id}`);
  },
};