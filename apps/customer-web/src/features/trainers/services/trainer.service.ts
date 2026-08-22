import { trainerApi } from "@/src/features/trainers/api/trainer.api";
import {
  filterTrainersByCourseId,
  normalizeTrainer,
  normalizeTrainerList,
} from "@/src/features/trainers/mappers/trainer.mapper";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export const trainerService = {
  async getTrainers(): Promise<
    Trainer[]
  > {
    const response =
      await trainerApi.getTrainers();

    return normalizeTrainerList(response.data.data);
  },

  async getCourseTrainers(courseId: string): Promise<Trainer[]> {
    const trainers = await this.getTrainers();
    return filterTrainersByCourseId(trainers, courseId);
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