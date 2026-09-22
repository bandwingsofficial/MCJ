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

/** Empty string when there is no discount (0). */
export function formatOptionalAmountInput(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }
  return formatAmountInput(value);
}

/** Empty string when there is no discount (0). */
export function formatOptionalPercentInput(value: number): string {
  if (!Number.isFinite(value) || value === 0) {
    return "";
  }
  return formatPercentInput(value);
}

export function getOriginalPriceError(value: string): string | null {
  const parsed = parseNumeric(value);
  if (parsed === null || parsed <= 0) {
    return "Enter a valid price.";
  }
  return null;
}

export function getDiscountPercentError(value: string): string | null {
  if (value.trim() === "") {
    return null;
  }
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
  if (value.trim() === "") {
    return null;
  }
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

export function getEffectiveDiscountAmount(state: {
  originalPrice: string;
  discountPercent: string;
  discountAmount: string;
}): number {
  const original = parseNumeric(state.originalPrice);
  const amountRaw = state.discountAmount.trim();
  const percentRaw = state.discountPercent.trim();

  if (amountRaw !== "") {
    const amount = parseNumeric(amountRaw);
    if (amount !== null && amount >= 0) {
      if (original !== null && original > 0) {
        return roundMoney(Math.min(amount, original));
      }
      return roundMoney(amount);
    }
  }

  if (percentRaw !== "") {
    const percent = parseNumeric(percentRaw);
    if (
      percent !== null &&
      percent >= 0 &&
      original !== null &&
      original > 0
    ) {
      return roundMoney((original * percent) / 100);
    }
  }

  return 0;
}

export function getModeTabFinalAmount(state: {
  originalPrice: string;
  discountPercent: string;
  discountAmount: string;
}): number {
  const original = parseNumeric(state.originalPrice);
  if (original === null || original <= 0) {
    return 0;
  }
  const discount = getEffectiveDiscountAmount(state);
  return roundMoney(Math.max(0, original - discount));
}

export function isModeTabPricingValid(state: {
  originalPrice: string;
  discountPercent: string;
  discountAmount: string;
}): boolean {
  const originalPriceNumber = parseNumeric(state.originalPrice);
  return (
    !getOriginalPriceError(state.originalPrice) &&
    !getDiscountPercentError(state.discountPercent) &&
    !getDiscountAmountError(state.discountAmount, originalPriceNumber) &&
    originalPriceNumber !== null &&
    originalPriceNumber > 0
  );
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
    discountPercent: formatOptionalPercentInput(pricing.discountPercent),
    discountAmount: formatOptionalAmountInput(pricing.discountAmount),
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
