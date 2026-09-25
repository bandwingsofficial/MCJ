import type { BatchDurationType } from "@/src/features/batches/types/batch-duration.types";

type DurationSource = {
  durationValue?: number | null;
  durationType?: BatchDurationType | string | null;
};

const DURATION_TYPE_LABELS: Record<string, string> = {
  DAYS: "Days",
  WEEKS: "Weeks",
  MONTHS: "Months",
  HOURS: "Hours",
};

function formatDurationType(type: string | null | undefined): string {
  if (!type) {
    return "—";
  }
  return DURATION_TYPE_LABELS[type] ?? type;
}

/** Batch duration with course fallback (matches Admin batch duration display). */
export function formatEnrollmentDuration(
  batch: DurationSource | null | undefined,
  course: { duration?: number | null; durationType?: string | null },
): string {
  if (
    batch?.durationValue != null &&
    batch.durationType &&
    Number(batch.durationValue) > 0
  ) {
    return formatBatchDuration(batch);
  }

  if (course.duration != null && course.durationType) {
    const typeLabel = formatDurationType(course.durationType);
    const value = Number(course.duration);
    const singular = typeLabel.replace(/s$/i, "");
    return `${value} ${value === 1 ? singular : typeLabel.toLowerCase()}`;
  }

  return "—";
}

export function formatBatchDuration(batch: DurationSource): string {
  if (
    batch.durationValue == null ||
    !batch.durationType ||
    Number(batch.durationValue) <= 0
  ) {
    return "—";
  }

  const typeLabel = formatDurationType(String(batch.durationType));
  const value = Number(batch.durationValue);
  const singular = typeLabel.replace(/s$/i, "");

  return `${value} ${value === 1 ? singular : typeLabel.toLowerCase()}`;
}
