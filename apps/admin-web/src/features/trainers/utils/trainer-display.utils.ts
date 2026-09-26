import type {
  TrainerDisplayStatus,
  TrainerStatus,
} from "@/src/features/trainers/types/trainer.types";

import { isArchivedTrainer } from "@/src/features/trainers/utils/trainer-bulk.utils";

type TrainerStatusSource = {
  status: TrainerStatus | string;
  deletedAt?: string | null;
  isDeleted?: boolean;
};

function normalizeTrainerStatus(status: TrainerStatus | string): TrainerStatus {
  if (
    status === "ACTIVE" ||
    status === "INACTIVE" ||
    status === "ARCHIVED"
  ) {
    return status;
  }

  return "INACTIVE";
}

export function getTrainerDisplayStatus(
  trainer: TrainerStatusSource,
): TrainerDisplayStatus {
  const status = normalizeTrainerStatus(trainer.status);

  if (
    isArchivedTrainer({ ...trainer, status }) ||
    status === "ARCHIVED"
  ) {
    return "ARCHIVED";
  }

  if (status === "ACTIVE") {
    return "ACTIVE";
  }

  return "INACTIVE";
}
