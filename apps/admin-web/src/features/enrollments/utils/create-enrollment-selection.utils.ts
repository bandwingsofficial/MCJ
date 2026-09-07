import type {
  Batch,
  BatchMode,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import { getBatchModePricing } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatTimingDateRange,
  formatTimingDays,
  formatTimingRange,
  getTimingAvailableSeats,
  getTimingEnrolledCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { formatBatchOverviewDate } from "@/src/features/batches/utils/batch-progress.utils";

export { getTimingEnrolledCount, getTimingAvailableSeats } from "@/src/features/batches/utils/batch-timing.utils";

export function isTimingSelectable(
  timing: BatchTiming,
  reservedTimingId?: string,
): boolean {
  if (timing.isDeleted || !timing.isActive) {
    return false;
  }

  if (reservedTimingId && timing.id === reservedTimingId) {
    return true;
  }

  return getTimingAvailableSeats(timing) > 0;
}

export function formatEnrollmentTimingSchedule(timing: BatchTiming): string {
  return `${formatTimingDays(timing.daysOfWeek)} · ${formatTimingRange(timing)}`;
}

export function formatEnrollmentTimingDateRange(timing: BatchTiming): string {
  return formatTimingDateRange(timing);
}

export function findBatchTimingById(
  batch: Batch | null | undefined,
  timingId: string,
): BatchTiming | undefined {
  return batch?.timings?.find((timing) => timing.id === timingId);
}

/** Pricing for the mode assigned to a specific batch timing (resolved by timing ID). */
export function getCreateEnrollmentTimingPricing(
  batch: Batch | null | undefined,
  timingId: string,
) {
  const timing = findBatchTimingById(batch, timingId);
  if (!timing) {
    return null;
  }

  return getBatchModePricing(batch, timing.mode);
}

export function getCreateEnrollmentModePricing(
  batch: Batch | null | undefined,
  mode: BatchMode,
) {
  return getBatchModePricing(batch, mode);
}

export function formatEnrollmentOverviewDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return formatBatchOverviewDate(value);
}
