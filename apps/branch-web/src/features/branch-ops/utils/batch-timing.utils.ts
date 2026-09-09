import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";

import {
  formatBatchDate,
  formatBatchTime,
  formatBatchTiming,
  formatWorkingDays,
} from "./batch-display";
import {
  BATCH_MODE_SECTION_LABELS,
  type BatchMode,
} from "./batch-mode.utils";

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const DAY_LABELS: Record<(typeof DAY_ORDER)[number], string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function getBatchTimings(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): BatchTimingListItem[] {
  return batch?.timings ?? [];
}

export function getBatchTimingsCount(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): number {
  return getBatchTimings(batch).length;
}

export function formatTimingRange(timing: BatchTimingListItem): string {
  return formatBatchTiming(timing.startTime, timing.endTime);
}

export function formatTimingDateRange(timing: BatchTimingListItem): string {
  const start = formatBatchDate(timing.startDate);
  const end = formatBatchDate(timing.endDate);
  if (start === "—" && end === "—") return "—";
  if (end === "—") return start;
  return `${start} – ${end}`;
}

export function formatTimingDays(days?: string[] | null): string {
  if (!days?.length) {
    return "—";
  }

  const ordered = DAY_ORDER.filter((day) => days.includes(day));

  if (ordered.length === 0) {
    return formatWorkingDays(days);
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

export function formatBatchOverviewDate(value?: string | null): string {
  return formatBatchDate(value);
}

export function formatBatchOverviewTiming(
  start?: string | null,
  end?: string | null,
): string {
  return formatBatchTiming(start, end);
}

export function formatBatchDaysLabel(days?: string[] | null): string {
  return formatWorkingDays(days);
}

export function getTimingEnrolledCount(timing: BatchTimingListItem): number {
  return timing.enrolledStudents ?? 0;
}

export function getTimingAvailableSeats(timing: BatchTimingListItem): number {
  if (timing.availableSeats != null) {
    return timing.availableSeats;
  }

  return Math.max(0, timing.capacity - getTimingEnrolledCount(timing));
}

export function getBatchTotalCapacity(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): number {
  return getBatchTimings(batch).reduce(
    (total, timing) => total + (timing.capacity ?? 0),
    0,
  );
}

export function getBatchTotalEnrolled(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): number {
  return getBatchTimings(batch).reduce(
    (total, timing) => total + getTimingEnrolledCount(timing),
    0,
  );
}

export function getBatchTotalAvailableSeats(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
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

export function getBatchModeSummaries(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): BatchModeSummary[] {
  const totals = new Map<
    BatchMode,
    { timingsCount: number; studentsCount: number }
  >();

  for (const timing of getBatchTimings(batch)) {
    if (
      timing.mode !== "OFFLINE" &&
      timing.mode !== "ONLINE" &&
      timing.mode !== "RECORDED"
    ) {
      continue;
    }

    const current = totals.get(timing.mode) ?? {
      timingsCount: 0,
      studentsCount: 0,
    };

    totals.set(timing.mode, {
      timingsCount: current.timingsCount + 1,
      studentsCount: current.studentsCount + getTimingEnrolledCount(timing),
    });
  }

  return (["OFFLINE", "ONLINE", "RECORDED"] as const)
    .filter((mode) => totals.has(mode))
    .map((mode) => {
      const stats = totals.get(mode)!;

      return {
        mode,
        label: BATCH_MODE_SECTION_LABELS[mode],
        timingsCount: stats.timingsCount,
        studentsCount: stats.studentsCount,
      };
    });
}

export interface BatchModeSummary {
  mode: BatchMode;
  label: string;
  timingsCount: number;
  studentsCount: number;
}

export function getBatchAggregateStats(
  batch: Pick<BatchListItem, "timings"> | null | undefined,
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
  batch: Pick<BatchListItem, "timings"> | null | undefined,
): string {
  const stats = getBatchAggregateStats(batch);

  if (stats.totalTimings === 0) {
    return "—";
  }

  return `${stats.totalEnrolled} / ${stats.totalCapacity}`;
}

export function formatBatchDuration(
  batch: Pick<
    BatchListItem,
    "durationLabel" | "durationValue" | "durationType"
  >,
): string {
  if (batch.durationLabel?.trim()) {
    return batch.durationLabel.trim();
  }

  if (batch.durationValue != null && batch.durationType) {
    return `${batch.durationValue} ${batch.durationType}`;
  }

  return "—";
}

export function formatBatchDurationType(
  batch: Pick<BatchListItem, "durationType">,
): string {
  if (!batch.durationType) {
    return "—";
  }

  return batch.durationType
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

export function formatBatchTimeLabel(value?: string | null): string {
  return formatBatchTime(value) || "—";
}
