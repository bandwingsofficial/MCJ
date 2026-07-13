import { trainerApi } from "@/src/features/trainers/api/trainer.api";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export const trainerService = {
  async getTrainers(): Promise<
    Trainer[]
  > {
    const response =
      await trainerApi.getTrainers();

    return response.data.data;
  },

  async getTrainer(
    id: string,
  ): Promise<Trainer> {
    const response =
      await trainerApi.getTrainer(
        id,
      );

    return response.data.data;
  },
};