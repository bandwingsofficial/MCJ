import type {
  Batch,
  BatchMode,
  BatchTiming,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";
import { FILTER_BATCH_MODES } from "@/src/features/batches/constants/batch.constants";
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

export function getTimingEnrolledCount(timing: BatchTiming): number {
  return timing.enrolledCount ?? timing.studentsCount ?? 0;
}

export function getTimingAvailableSeats(timing: BatchTiming): number {
  return Math.max(0, timing.capacity - getTimingEnrolledCount(timing));
}

/** Sum capacity across every child batch timing on the parent batch. */
export function getBatchTotalCapacity(
  batch: Batch | null | undefined,
): number {
  return getBatchTimings(batch).reduce(
    (total, timing) => total + (timing.capacity ?? 0),
    0,
  );
}

/** Sum enrolled students across every child batch timing on the parent batch. */
export function getBatchTotalEnrolled(
  batch: Batch | null | undefined,
): number {
  return getBatchTimings(batch).reduce(
    (total, timing) => total + getTimingEnrolledCount(timing),
    0,
  );
}

export function getBatchTotalAvailableSeats(
  batch: Batch | null | undefined,
): number {
  return Math.max(
    0,
    getBatchTotalCapacity(batch) - getBatchTotalEnrolled(batch),
  );
}

export interface BatchAggregateStats {
  totalTimings: number;
  totalCapacity: number;
  totalEnrolled: number;
  totalAvailableSeats: number;
  offlineTimingsCount: number;
  onlineTimingsCount: number;
  recordedTimingsCount: number;
}

/** Parent-batch totals derived from all assigned child timings (all modes). */
export function getBatchAggregateStats(
  batch: Batch | null | undefined,
): BatchAggregateStats {
  const modeSummaries = getBatchModeSummaries(batch);
  const findModeCount = (mode: BatchMode) =>
    modeSummaries.find((row) => row.mode === mode)?.timingsCount ?? 0;

  return {
    totalTimings: getBatchTimingsCount(batch),
    totalCapacity: getBatchTotalCapacity(batch),
    totalEnrolled: getBatchTotalEnrolled(batch),
    totalAvailableSeats: getBatchTotalAvailableSeats(batch),
    offlineTimingsCount: findModeCount("OFFLINE"),
    onlineTimingsCount: findModeCount("ONLINE"),
    recordedTimingsCount: findModeCount("RECORDED"),
  };
}

export function formatBatchEnrollmentCapacityLabel(
  batch: Batch | null | undefined,
): string {
  const stats = getBatchAggregateStats(batch);

  if (stats.totalTimings === 0) {
    return "—";
  }

  return `${stats.totalEnrolled} / ${stats.totalCapacity}`;
}

const MODE_SUMMARY_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

const MODE_SUMMARY_LABELS = Object.fromEntries(
  FILTER_BATCH_MODES.map(({ value, label }) => [value, label]),
) as Record<BatchMode, string>;

export interface BatchModeSummary {
  mode: BatchMode;
  label: string;
  timingsCount: number;
  studentsCount: number;
}

/** Groups child batch timings by mode for parent batch overview. */
export function getBatchModeSummaries(
  batch: Batch | null | undefined,
): BatchModeSummary[] {
  const totals = new Map<
    BatchMode,
    { timingsCount: number; studentsCount: number }
  >();

  for (const timing of getBatchTimings(batch)) {
    const current = totals.get(timing.mode) ?? {
      timingsCount: 0,
      studentsCount: 0,
    };

    totals.set(timing.mode, {
      timingsCount: current.timingsCount + 1,
      studentsCount:
        current.studentsCount + getTimingEnrolledCount(timing),
    });
  }

  return MODE_SUMMARY_ORDER.filter((mode) => totals.has(mode)).map((mode) => {
    const stats = totals.get(mode)!;

    return {
      mode,
      label: MODE_SUMMARY_LABELS[mode] ?? mode,
      timingsCount: stats.timingsCount,
      studentsCount: stats.studentsCount,
    };
  });
}
