import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";

import {
  getBatchTimings,
  getTimingEnrolledCount,
  type BatchModeSummary,
} from "./batch-timing.utils";

export type BatchMode = "OFFLINE" | "ONLINE" | "RECORDED";

export const BATCH_MODE_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

export const BATCH_MODE_SECTION_LABELS: Record<BatchMode, string> = {
  OFFLINE: "Offline / Classroom",
  ONLINE: "Online",
  RECORDED: "Self-Paced / Recorded",
};

export const BATCH_MODE_LABELS: Record<BatchMode, string> =
  BATCH_MODE_SECTION_LABELS;

export function getBatchModeLabel(mode: BatchMode): string {
  return BATCH_MODE_LABELS[mode] ?? mode;
}

export function isBatchMode(value: string): value is BatchMode {
  return value === "OFFLINE" || value === "ONLINE" || value === "RECORDED";
}

export function getBatchModeSectionLabel(mode: string): string {
  if (mode === "OFFLINE" || mode === "ONLINE" || mode === "RECORDED") {
    return BATCH_MODE_SECTION_LABELS[mode];
  }

  return mode;
}

export function getTimingsForMode(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
  mode: BatchMode,
): BatchTimingListItem[] {
  return (batch?.timings ?? []).filter((timing) => timing.mode === mode);
}

export function getConfiguredBatchModes(
  batch: Pick<
    BatchListItem,
    "timings" | "learningModes" | "mode" | "modePricing"
  > | null | undefined,
): BatchMode[] {
  if (!batch) {
    return [];
  }

  const modes = new Set<BatchMode>();

  for (const timing of batch.timings ?? []) {
    if (isBatchMode(timing.mode)) {
      modes.add(timing.mode);
    }
  }

  for (const mode of batch.learningModes ?? []) {
    if (isBatchMode(mode)) {
      modes.add(mode);
    }
  }

  for (const key of Object.keys(batch.modePricing ?? {})) {
    if (isBatchMode(key)) {
      modes.add(key);
    }
  }

  if (modes.size === 0 && batch.mode && isBatchMode(batch.mode)) {
    modes.add(batch.mode);
  }

  return BATCH_MODE_ORDER.filter((mode) => modes.has(mode));
}

export function getBatchModes(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): BatchMode[] {
  const modes = new Set(
    getBatchTimings(batch)
      .map((timing) => timing.mode)
      .filter(isBatchMode),
  );

  return BATCH_MODE_ORDER.filter((mode) => modes.has(mode));
}

export function getModeStudentCount(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
  mode: BatchMode,
): number {
  return getTimingsForMode(batch, mode).reduce(
    (total, timing) => total + getTimingEnrolledCount(timing),
    0,
  );
}

export interface BatchModePricing {
  originalPrice: number;
  discountAmount: number;
  discountedPrice: number;
  currency: string;
  isFree?: boolean;
}

export type BatchModePricingMap = Partial<Record<BatchMode, BatchModePricing>>;

export function getBatchModePricingMap(
  batch: Pick<
    BatchListItem,
    "modePricing" | "timings" | "learningModes" | "mode"
  > | null | undefined,
): BatchModePricingMap {
  if (batch?.modePricing && Object.keys(batch.modePricing).length > 0) {
    const map: BatchModePricingMap = {};

    for (const mode of getConfiguredBatchModes(batch)) {
      const pricing = batch.modePricing[mode];
      if (pricing) {
        map[mode] = {
          ...pricing,
          isFree: pricing.discountedPrice <= 0,
        };
      }
    }

    return map;
  }

  return {};
}

export function getBatchModePricing(
  batch: Pick<
    BatchListItem,
    "modePricing" | "timings" | "learningModes" | "mode"
  > | null | undefined,
  mode: BatchMode,
): BatchModePricing | null {
  return getBatchModePricingMap(batch)[mode] ?? null;
}

export function getConfiguredBatchModeSummaries(
  batch: Pick<
    BatchListItem,
    "timings" | "learningModes" | "mode" | "modePricing"
  > | null | undefined,
): BatchModeSummary[] {
  if (!batch) {
    return [];
  }

  return getConfiguredBatchModes(batch).map((mode) => {
    const timings = getTimingsForMode(batch, mode);

    return {
      mode,
      label: BATCH_MODE_SECTION_LABELS[mode],
      timingsCount: timings.length,
      studentsCount: timings.reduce(
        (total, timing) => total + getTimingEnrolledCount(timing),
        0,
      ),
    };
  });
}

export function getConfiguredModeSummaries(
  batch: Pick<
    BatchListItem,
    "timings" | "learningModes" | "mode" | "modePricing"
  > | null | undefined,
) {
  return getConfiguredBatchModeSummaries(batch).map((summary) => ({
    ...summary,
    pricing: getBatchModePricing(batch, summary.mode),
  }));
}
