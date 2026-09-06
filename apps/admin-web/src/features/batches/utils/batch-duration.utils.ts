import { BATCH_DURATION_TYPES } from "@/src/features/batches/constants/batch.constants";
import type { Batch } from "@/src/features/batches/types/batch.types";
import type { BatchDurationType } from "@/src/features/batches/types/batch.types";
import {
  batchDurationSchema,
} from "@/src/features/batches/schemas/batch.schema";
import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";

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

export function parseBatchDuration(input: {
  durationValue: number;
  durationType: BatchDurationType;
}) {
  return batchDurationSchema.safeParse(input);
}

export function getBatchDurationErrorMessage(
  result: ReturnType<typeof parseBatchDuration>,
): string | null {
  if (result.success) {
    return null;
  }

  const fieldErrors = result.error.flatten().fieldErrors;

  return (
    fieldErrors.durationValue?.[0] ??
    fieldErrors.durationType?.[0] ??
    result.error.issues[0]?.message ??
    null
  );
}

export function getBatchDurationFieldStates(
  touched: boolean,
  errorMessage: string | null,
): {
  valueState: FieldVisualState;
  typeState: FieldVisualState;
} {
  if (!touched) {
    return { valueState: "neutral", typeState: "neutral" };
  }

  if (errorMessage) {
    return { valueState: "invalid", typeState: "invalid" };
  }

  return { valueState: "valid", typeState: "valid" };
}
