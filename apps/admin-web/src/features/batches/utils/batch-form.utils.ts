import type { BatchFormValues } from "@/src/features/batches/schemas/batch.schema";
import type {
  CreateBatchRequest,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";

export const DESCRIPTION_WORD_LIMIT = 150;

export function countWords(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

export function toCreateBatchRequest(
  values: BatchFormValues,
): CreateBatchRequest {
  return {
    name: values.name.trim(),
    code: values.code.trim().toUpperCase(),
    description: values.description?.trim() || undefined,
    categoryId: values.categoryId,
    startDate: values.startDate,
    endDate: values.endDate,
    startTime: values.startTime,
    endTime: values.endTime,
    daysOfWeek: values.daysOfWeek,
    capacity: values.capacity,
    enrolledCount: values.enrolledCount ?? 0,
    mode: values.mode,
    isFeatured: values.isFeatured,
  };
}

export function toUpdateBatchRequest(
  values: BatchFormValues,
): UpdateBatchRequest {
  return toCreateBatchRequest(values);
}
