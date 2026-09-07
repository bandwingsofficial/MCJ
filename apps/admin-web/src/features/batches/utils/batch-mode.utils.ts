import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
import type {
  Batch,
  BatchMode,
  BatchModePricing,
  BatchModePricingMap,
} from "@/src/features/batches/types/batch.types";
import { getBatchPricing } from "@/src/features/batches/utils/batch-pricing.util";
import {
  getBatchModeSummaries,
  getBatchTimings,
} from "@/src/features/batches/utils/batch-timing.utils";

export const BATCH_MODE_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

export const BATCH_MODE_LABELS = Object.fromEntries(
  FILTER_BATCH_MODES.map(({ value, label }) => [value, label]),
) as Record<BatchMode, string>;

export function getBatchModeLabel(mode: BatchMode): string {
  return BATCH_MODE_LABELS[mode] ?? mode;
}

export function getBatchModes(batch: Batch | null | undefined): BatchMode[] {
  const modes = new Set(getBatchTimings(batch).map((timing) => timing.mode));
  return BATCH_MODE_ORDER.filter((mode) => modes.has(mode));
}

export function formatBatchModesLabel(
  batch: Batch | null | undefined,
): string {
  const modes = getBatchModes(batch);
  if (modes.length === 0) {
    return getBatchModeLabel(batch?.mode ?? "OFFLINE");
  }
  return modes.map((mode) => getBatchModeLabel(mode)).join(" / ");
}

export function getTimingsForMode(
  batch: Batch | null | undefined,
  mode: BatchMode,
) {
  return getBatchTimings(batch).filter((timing) => timing.mode === mode);
}

export function getModeStudentCount(
  batch: Batch | null | undefined,
  mode: BatchMode,
): number {
  return getTimingsForMode(batch, mode).reduce(
    (total, timing) => total + (timing.studentsCount ?? 0),
    0,
  );
}

export function getBatchModePricingMap(
  batch: Batch | null | undefined,
): BatchModePricingMap {
  if (batch?.modePricing && Object.keys(batch.modePricing).length > 0) {
    return batch.modePricing;
  }

  const fallback = getBatchPricing(batch ?? ({} as Batch));
  const map: BatchModePricingMap = {};

  for (const mode of getBatchModes(batch)) {
    map[mode] = {
      originalPrice: fallback.originalPrice,
      discountAmount: fallback.discountAmount,
      discountedPrice: fallback.discountedPrice,
      discountPercent: fallback.discountPercent,
      currency: fallback.currency,
      isFree: fallback.isFree,
    };
  }

  return map;
}

export function getBatchModePricing(
  batch: Batch | null | undefined,
  mode: BatchMode,
): BatchModePricing | null {
  const map = getBatchModePricingMap(batch);
  return map[mode] ?? null;
}

export function getConfiguredModeSummaries(batch: Batch | null | undefined) {
  return getBatchModeSummaries(batch).map((summary) => ({
    ...summary,
    pricing: getBatchModePricing(batch, summary.mode),
  }));
}

export function isBatchMode(value: string): value is BatchMode {
  return value === "OFFLINE" || value === "ONLINE" || value === "RECORDED";
}
