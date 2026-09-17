import { trainerApi } from "@/src/features/trainers/api/trainer.api";
import {
  normalizeTrainer,
  normalizeTrainerList,
} from "@/src/features/trainers/mappers/trainer.mapper";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export const trainerService = {
  async getTrainers(filters?: Parameters<typeof trainerApi.getTrainers>[0]): Promise<
    Trainer[]
  > {
    const response =
      await trainerApi.getTrainers(filters);

    return normalizeTrainerList(response.data.data);
  },

  async getCourseTrainers(courseId: string): Promise<Trainer[]> {
    return this.getTrainers({ courseId });
  },

  async getTrainer(
    id: string,
  ): Promise<Trainer> {
    const response =
      await trainerApi.getTrainer(
        id,
      );

    return normalizeTrainer(response.data.data);
  },
};