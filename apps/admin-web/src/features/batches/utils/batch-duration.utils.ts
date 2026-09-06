import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type { Batch } from "@/src/features/batches/types/batch.types";

type DurationSource = Pick<Batch, "durationValue" | "durationType">;

export function formatBatchDurationType(batch: DurationSource): string {
  if (!batch.durationType) {
    return "—";
  }

  return (
    BATCH_DURATION_TYPES.find((item) => item.value === batch.durationType)
      ?.label ?? batch.durationType
  );
}

/** Combines the stored durationValue + durationType, e.g. "2 months". */
export function formatBatchDuration(batch: DurationSource): string {
  if (
    batch.durationValue == null ||
    !batch.durationType ||
    Number(batch.durationValue) <= 0
  ) {
    return "—";
  }

  const typeLabel = formatBatchDurationType(batch);
  const value = Number(batch.durationValue);
  const singular = typeLabel.replace(/s$/i, "");

  return `${value} ${value === 1 ? singular : typeLabel.toLowerCase()}`;
}
