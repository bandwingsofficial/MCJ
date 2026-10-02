import {
  DEFAULT_BATCH_DURATION,
  type BatchFormValues,
} from "@/src/features/batches/schemas/batch.schema";
import type {
  Batch,
  CreateBatchRequest,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";
import { buildBatchPricingInput } from "@/src/features/batches/utils/batch-pricing.util";

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
  const pricing = buildBatchPricingInput({
    originalPrice: Number(values.originalPrice) || 0,
    discountAmount: Number(values.discountAmount) || 0,
    discountPercent: Number(values.discountPercent) || 0,
    currency: values.currency,
    isFree: values.isFree,
  });

  return {
    name: values.name.trim(),
    courseId: values.courseId,
    description: values.description?.trim() || undefined,
    startDate: values.startDate,
    endDate: values.endDate,
    startTime: values.startTime,
    endTime: values.endTime,
    daysOfWeek: values.daysOfWeek,
    capacity: values.capacity,
    enrolledCount: values.enrolledCount ?? 0,
    mode: values.mode,
    isFeatured: values.isFeatured,
    originalPrice: pricing.originalPrice,
    discountAmount: pricing.discountAmount,
    discountedPrice: pricing.discountedPrice,
    currency: pricing.currency,
    isFree: pricing.isFree,
    durationValue: Number(values.durationValue),
    durationType: values.durationType,
  };
}

export function toUpdateBatchRequest(
  values: BatchFormValues,
): UpdateBatchRequest {
  return toCreateBatchRequest(values);
}

function normalizeBatchDate(value: string | null | undefined): string {
  if (!value?.trim()) {
    return new Date().toISOString().split("T")[0]!;
  }

  return value.split("T")[0]!;
}

export function batchToFormValues(batch: Batch): BatchFormValues {
  return {
    name: batch.name ?? "",
    code: batch.code ?? "",
    courseId: batch.courseId ?? "",
    description: batch.description ?? "",
    startDate: normalizeBatchDate(batch.startDate),
    endDate: normalizeBatchDate(batch.endDate ?? batch.startDate),
    startTime: batch.startTime ?? "10:00",
    endTime: batch.endTime ?? "12:00",
    daysOfWeek: batch.daysOfWeek?.length
      ? batch.daysOfWeek
      : ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    capacity: batch.capacity ?? 1,
    enrolledCount: batch.enrolledCount ?? 0,
    mode: batch.mode ?? "ONLINE",
    durationValue:
      batch.durationValue ?? DEFAULT_BATCH_DURATION.durationValue,
    durationType:
      batch.durationType ?? DEFAULT_BATCH_DURATION.durationType,
    isFeatured: Boolean(batch.isFeatured),
    originalPrice: Number(batch.originalPrice) || 0,
    discountPercent: Number(batch.discountPercent) || 0,
    discountAmount: Number(batch.discountAmount) || 0,
    currency: batch.currency ?? "INR",
    isFree: Boolean(batch.isFree),
  };
}
