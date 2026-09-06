import type {
  Batch,
  BatchTiming,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchTiming,
  formatBatchDateRange,
} from "@/src/features/batches/utils/batch.helper";

const DAY_ORDER: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

/** Timings owned by this batch, ordered for display. */
export function getBatchTimings(batch: Batch | null | undefined): BatchTiming[] {
  return batch?.timings ?? [];
}

export function getBatchTimingsCount(batch: Batch | null | undefined): number {
  return batch?.timingsCount ?? getBatchTimings(batch).length;
}

export function formatTimingRange(timing: BatchTiming): string {
  return formatBatchTiming(timing.startTime, timing.endTime);
}

export function formatTimingDateRange(timing: BatchTiming): string {
  return formatBatchDateRange(timing.startDate, timing.endDate);
}

/** "Monday – Saturday" for a contiguous run, otherwise a comma list. */
export function formatTimingDays(days: DayOfWeek[] | undefined): string {
  if (!days?.length) {
    return "—";
  }

  const ordered = DAY_ORDER.filter((day) => days.includes(day));

  if (ordered.length === 0) {
    return "—";
  }

  if (ordered.length === 1) {
    return DAY_LABELS[ordered[0]];
  }

  const firstIndex = DAY_ORDER.indexOf(ordered[0]);
  const lastIndex = DAY_ORDER.indexOf(ordered[ordered.length - 1]);
  const isContiguous = lastIndex - firstIndex + 1 === ordered.length;

  if (isContiguous) {
    return `${DAY_LABELS[ordered[0]]} – ${DAY_LABELS[ordered[ordered.length - 1]]}`;
  }

  return ordered.map((day) => DAY_LABELS[day].slice(0, 3)).join(", ");
}

/** Compact schedule label for the batches list: one line, never wide. */
export function formatBatchTimingsSummary(batch: Batch): string {
  const timings = getBatchTimings(batch);
  const count = getBatchTimingsCount(batch);

  if (count === 0) {
    return formatBatchTiming(batch.startTime, batch.endTime);
  }

  if (count === 1 && timings[0]) {
    return `${timings[0].name} · ${formatTimingRange(timings[0])}`;
  }

  return `${count} Batch Timings`;
}

/** Full timing names, used as the tooltip behind the summary label. */
export function formatBatchTimingNames(batch: Batch): string {
  const names = getBatchTimings(batch).map((timing) => timing.name.trim());

  return names.length ? names.join(" • ") : "";
}
