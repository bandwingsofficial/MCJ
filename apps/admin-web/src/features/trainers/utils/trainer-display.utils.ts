import type {
  TrainerDisplayStatus,
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

type TrainerStatusSource = Pick<TrainerListItem, "status"> & {
  deletedAt?: string | null;
  isDeleted?: boolean;
};

export function getTrainerDisplayStatus(
  trainer: TrainerStatusSource,
): TrainerDisplayStatus {
  if (isArchivedTrainer(trainer) || trainer.status === "ARCHIVED") {
    return "ARCHIVED";
  }

  if (trainer.status === "ACTIVE") {
    return "ACTIVE";
  }

  return "INACTIVE";
}
