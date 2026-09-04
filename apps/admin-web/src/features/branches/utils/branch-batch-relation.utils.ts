import { COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/batches/utils/batch-course.utils";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import { formatTrainerNames } from "@/src/features/branches/utils/branch-display.utils";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

export interface BranchBatchRelationMeta {
  courseTitle: string;
  categoryLabel: string;
  trainerLabel: string;
}

/**
 * Resolve display fields from Batch → Course → Category / Course trainers.
 * Course trainers are loaded via the existing Course assignment API (not BatchTrainer).
 */
export async function loadBranchBatchRelationMeta(
  batches: Batch[],
): Promise<Record<string, BranchBatchRelationMeta>> {
  const trainersByCourseId = new Map<string, string>();

  const uniqueCourseIds = Array.from(
    new Set(
      batches
        .map((batch) => batch.courseId?.trim() || batch.course?.id?.trim() || "")
        .filter(Boolean),
    ),
  );

  await Promise.all(
    uniqueCourseIds.map(async (courseId) => {
      try {
        const trainers = await trainerService.getTrainersForCourse(courseId);
        const label = formatTrainerNames(trainers).trim();
        trainersByCourseId.set(
          courseId,
          label || COURSE_TRAINER_UNASSIGNED_LABEL,
        );
      } catch {
        trainersByCourseId.set(courseId, COURSE_TRAINER_UNASSIGNED_LABEL);
      }
    }),
  );

  const entries = batches.map((batch) => {
    const courseId = batch.courseId?.trim() || batch.course?.id?.trim() || "";
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
        trainerLabel: courseId
          ? (trainersByCourseId.get(courseId) ?? COURSE_TRAINER_UNASSIGNED_LABEL)
          : COURSE_TRAINER_UNASSIGNED_LABEL,
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
