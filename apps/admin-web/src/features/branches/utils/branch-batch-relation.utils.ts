import { COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/batches/utils/batch-course.utils";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import { formatTrainerNames } from "@/src/features/branches/utils/branch-display.utils";

export interface BranchBatchRelationMeta {
  courseTitle: string;
  categoryLabel: string;
  trainerLabel: string;
}

function formatBatchTrainerLabel(batch: Batch): string {
  const trainers = batch.trainers ?? [];
  const label = formatTrainerNames(trainers).trim();
  return label || COURSE_TRAINER_UNASSIGNED_LABEL;
}

/**
 * Resolve display fields from batch course/category and batch-level trainers.
 */
export async function loadBranchBatchRelationMeta(
  batches: Batch[],
): Promise<Record<string, BranchBatchRelationMeta>> {
  const entries = batches.map((batch) => {
    const courseTitle = batch.course?.title?.trim() || "";
    const categoryLabel =
      batch.course?.category?.name?.trim() ||
      batch.category?.name?.trim() ||
      "";

    return [
      batch.id,
      {
        courseTitle,
        categoryLabel,
        trainerLabel: formatBatchTrainerLabel(batch),
      },
    ] as const;
  });

  return Object.fromEntries(entries);
}

export function formatBatchDurationTypeLabel(
  durationType: Batch["durationType"],
): string {
  if (!durationType) {
    return "—";
  }

  return (
    BATCH_DURATION_TYPES.find((item) => item.value === durationType)?.label ??
    durationType
  );
}

export function formatBatchConfiguredDuration(batch: Batch): string {
  if (
    batch.durationValue == null ||
    !batch.durationType ||
    Number(batch.durationValue) <= 0
  ) {
    return "—";
  }

  const typeLabel = formatBatchDurationTypeLabel(batch.durationType);
  const value = Number(batch.durationValue);
  const singular = typeLabel.replace(/s$/i, "");

  return `${value} ${value === 1 ? singular : typeLabel.toLowerCase()}`;
}
