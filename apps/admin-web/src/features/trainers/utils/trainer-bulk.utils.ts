import type {
  BulkTrainerOperationResult,
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

type TrainerArchiveState = Pick<TrainerListItem, "status"> & {
  deletedAt?: string | null;
  isDeleted?: boolean;
};

export function isArchivedTrainer(
  trainer: TrainerArchiveState,
): boolean {
  return Boolean(trainer.deletedAt ?? trainer.isDeleted);
}

export function getEligibleActivateIds(
  trainers: TrainerListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return trainers
    .filter(
      (trainer) =>
        selected.has(trainer.id) &&
        !isArchivedTrainer(trainer) &&
        trainer.status === "INACTIVE"
    )
    .map((trainer) => trainer.id);
}

export function getEligibleDeactivateIds(
  trainers: TrainerListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return trainers
    .filter(
      (trainer) =>
        selected.has(trainer.id) &&
        !isArchivedTrainer(trainer) &&
        trainer.status === "ACTIVE"
    )
    .map((trainer) => trainer.id);
}

export function getEligibleDeleteIds(
  trainers: TrainerListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return trainers
    .filter(
      (trainer) =>
        selected.has(trainer.id) && !isArchivedTrainer(trainer)
    )
    .map((trainer) => trainer.id);
}

export function getEligibleRestoreIds(
  trainers: TrainerListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return trainers
    .filter(
      (trainer) =>
        selected.has(trainer.id) && isArchivedTrainer(trainer)
    )
    .map((trainer) => trainer.id);
}

export function getEligiblePermanentDeleteIds(
  trainers: TrainerListItem[],
  selectedIds: string[]
): string[] {
  return getEligibleRestoreIds(trainers, selectedIds);
}

export function formatBulkResultToast(
  result: BulkTrainerOperationResult,
  successLabel: string
): string {
  if (result.failedCount === 0) {
    return `${result.successCount} ${successLabel}`;
  }

  const failurePreview = result.failures
    .slice(0, 2)
    .map((item) => item.message)
    .join(" ");

  return `${result.successCount} ${successLabel}. ${result.failedCount} failed.${failurePreview ? ` ${failurePreview}` : ""}`;
}
