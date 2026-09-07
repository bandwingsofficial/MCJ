import { DEFAULT_BATCH_DURATION } from "@/src/features/batches/schemas/batch.schema";
import type {
  Batch,
  BatchDurationType,
  BatchMode,
  BatchModeConfigRequest,
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";
import { getBatchPricing } from "@/src/features/batches/utils/batch-pricing.util";

export type LastEditedDiscount = "PERCENTAGE" | "AMOUNT";

export interface AssignBatchFormSubmitPayload {
  courseId: string;
  name: string;
  mode: BatchMode;
  startDate: string;
  endDate: string;
  templateIds: string[];
  modeConfigs?: BatchModeConfigRequest[];
  durationValue: number;
  durationType: BatchDurationType;
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  currency: string;
  isFree: boolean;
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function roundPercent(value: number): number {
  return Math.round(value * 100) / 100;
}

export function parseNumeric(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatAmountInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return String(roundMoney(value));
}

export function formatPercentInput(value: number): string {
  if (!Number.isFinite(value)) {
    return "0";
  }
  return String(roundPercent(value));
}

export function getOriginalPriceError(value: string): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed <= 0) {
    return "Enter a valid price.";
  }
  return null;
}

export function getDiscountPercentError(value: string): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed < 0) {
    return "Enter a valid discount percentage.";
  }
  if (parsed > 100) {
    return "Discount percentage cannot exceed 100%.";
  }
  return null;
}

export function getDiscountAmountError(
  value: string,
  originalPrice: number | null,
): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed < 0) {
    return "Enter a valid discount amount.";
  }
  if (
    originalPrice !== null &&
    originalPrice > 0 &&
    parsed > originalPrice
  ) {
    return "Discount amount cannot be greater than original price.";
  }
  return null;
}

export function batchToAssignFormInitial(batch: Batch) {
  const pricing = getBatchPricing(batch);
  const startDate = batch.startDate.split("T")[0]!;
  const endDate = (batch.endDate ?? batch.startDate).split("T")[0]!;

  return {
    batchName: batch.name,
    batchNumber: batch.code,
    courseId: batch.courseId ?? "",
    mode: batch.mode,
    originalPrice: formatAmountInput(pricing.originalPrice),
    discountPercent: formatPercentInput(pricing.discountPercent),
    discountAmount: formatAmountInput(pricing.discountAmount),
    durationValue:
      batch.durationValue ?? DEFAULT_BATCH_DURATION.durationValue,
    durationType:
      batch.durationType ?? DEFAULT_BATCH_DURATION.durationType,
    startDate,
    endDate,
    selectedIds: (batch.timings ?? [])
      .map((timing) => timing.batchTemplateId)
      .filter((id): id is string => Boolean(id)),
  };
}

export function toUpdateBatchRequestFromAssignForm(
  payload: AssignBatchFormSubmitPayload,
  existingBatch: Batch,
): UpdateBatchRequest {
  return {
    name: payload.name,
    courseId: payload.courseId,
    mode: payload.mode,
    startDate: payload.startDate,
    endDate: payload.endDate,
    durationValue: payload.durationValue,
    durationType: payload.durationType,
    originalPrice: payload.originalPrice,
    discountAmount: payload.discountAmount,
    discountedPrice: payload.discountedPrice,
    currency: payload.currency,
    isFree: payload.isFree,
    startTime: existingBatch.startTime,
    endTime: existingBatch.endTime,
    daysOfWeek: existingBatch.daysOfWeek,
    capacity: existingBatch.capacity,
    enrolledCount: existingBatch.enrolledCount,
    templateIds: payload.templateIds,
    modeConfigs: payload.modeConfigs,
  };
}
