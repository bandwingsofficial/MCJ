import type { BatchFormValues } from "@/src/features/batches/schemas/batch.schema";
import type {
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
    code: values.code.trim().toUpperCase(),
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
