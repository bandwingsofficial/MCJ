import type {
  Batch,
  BatchMode,
  BatchPricing,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import {
  getBatchPricing,
  normalizeBatchPricing,
  type BatchPricing as NormalizedBatchPricing,
} from "@/src/features/batches/utils/batch-pricing.utils";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  isBatchDateExpired,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

export const COURSE_MODE_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

export const COURSE_MODE_LABELS: Record<BatchMode, string> = {
  OFFLINE: "Offline / Classroom",
  ONLINE: "Online",
  RECORDED: "Self-Paced / Pre-Recorded",
};

export interface CourseModeFeeRow {
  mode: BatchMode;
  modeLabel: string;
  pricing: NormalizedBatchPricing;
  timingCount: number;
}

export interface CourseUpcomingTimingRow {
  id: string;
  name: string;
  days: string;
  startTimeLabel: string;
  endTimeLabel: string;
  startDateLabel: string;
  endDateLabel: string;
  availableSeats: number;
  capacity: number;
  enrolledCount: number;
}

export interface CourseUpcomingModeGroup {
  mode: BatchMode;
  modeLabel: string;
  timings: CourseUpcomingTimingRow[];
}

export interface CourseUpcomingBatchGroup {
  batchId: string;
  batchName: string;
  batchCode: string;
  courseTitle: string;
  modeGroups: CourseUpcomingModeGroup[];
}

function isBatchMode(value: string): value is BatchMode {
  return value === "OFFLINE" || value === "ONLINE" || value === "RECORDED";
}

function getTimingAvailableSeats(
  timing: Pick<BatchTiming, "capacity" | "enrolledCount">,
): number {
  const capacity = Number.isFinite(timing.capacity) ? timing.capacity : 0;
  const enrolled = Number.isFinite(timing.enrolledCount)
    ? timing.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

export function isUpcomingTiming(timing: BatchTiming): boolean {
  if (!timing.isActive) {
    return false;
  }

  if (timing.status === "CANCELLED" || timing.status === "COMPLETED") {
    return false;
  }

  if (timing.status === "ONGOING") {
    return false;
  }

  if (isBatchDateExpired(timing)) {
    return false;
  }

  return timing.status === "UPCOMING";
}

export function isUpcomingBatch(batch: Batch): boolean {
  if (batch.isDeleted) {
    return false;
  }

  if (
    batch.status === "CANCELLED" ||
    batch.status === "COMPLETED" ||
    batch.status === "ONGOING"
  ) {
    return false;
  }

  if (isBatchDateExpired(batch)) {
    return false;
  }

  if (batch.status !== "UPCOMING") {
    return false;
  }

  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);
  if ((batch.timings?.length ?? 0) > 0) {
    return upcomingTimings.length > 0;
  }

  return true;
}

function getBatchAvailableSeats(batch: Batch): number {
  const capacity = Number.isFinite(batch.capacity) ? batch.capacity : 0;
  const enrolled = Number.isFinite(batch.enrolledCount)
    ? batch.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

function resolveModePricing(
  batch: Batch,
  mode: BatchMode,
): NormalizedBatchPricing {
  const configured = batch.modePricing?.[mode];

  if (configured) {
    return normalizeBatchPricing(configured);
  }

  if (batch.mode === mode) {
    return getBatchPricing(batch);
  }

  return normalizeBatchPricing(null);
}

function countUpcomingTimingsForMode(batch: Batch, mode: BatchMode): number {
  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

  if (upcomingTimings.length > 0) {
    return upcomingTimings.filter((timing) => timing.mode === mode).length;
  }

  return batch.mode === mode ? 1 : 0;
}

function getConfiguredModesForBatch(batch: Batch): BatchMode[] {
  const modes = new Set<BatchMode>();
  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

  if (upcomingTimings.length > 0) {
    upcomingTimings.forEach((timing) => modes.add(timing.mode));
  } else {
    modes.add(batch.mode);
  }

  if (batch.modePricing) {
    Object.keys(batch.modePricing).forEach((mode) => {
      if (isBatchMode(mode)) {
        modes.add(mode);
      }
    });
  }

  return COURSE_MODE_ORDER.filter((mode) => modes.has(mode));
}

export function buildCourseFeesByMode(batches: Batch[]): CourseModeFeeRow[] {
  const upcomingBatches = batches.filter(isUpcomingBatch);
  const rows = new Map<
    BatchMode,
    { pricing: NormalizedBatchPricing; timingCount: number }
  >();

  upcomingBatches.forEach((batch) => {
    getConfiguredModesForBatch(batch).forEach((mode) => {
      const timingCount = countUpcomingTimingsForMode(batch, mode);

      if (timingCount <= 0) {
        return;
      }

      const pricing = resolveModePricing(batch, mode);
      const existing = rows.get(mode);

      if (!existing) {
        rows.set(mode, { pricing, timingCount });
        return;
      }

      existing.timingCount += timingCount;
    });
  });

  return COURSE_MODE_ORDER.filter((mode) => rows.has(mode)).map((mode) => {
    const row = rows.get(mode)!;

    return {
      mode,
      modeLabel: COURSE_MODE_LABELS[mode],
      pricing: row.pricing,
      timingCount: row.timingCount,
    };
  });
}

function buildTimingRow(
  timing: Pick<
    BatchTiming,
    | "id"
    | "name"
    | "daysOfWeek"
    | "startTime"
    | "endTime"
    | "startDate"
    | "endDate"
    | "capacity"
    | "enrolledCount"
  >,
): CourseUpcomingTimingRow {
  return {
    id: timing.id,
    name: timing.name,
    days: formatBatchDays(timing.daysOfWeek ?? []),
    startTimeLabel: formatEnrollmentTime(timing.startTime),
    endTimeLabel: formatEnrollmentTime(timing.endTime),
    startDateLabel: formatEnrollmentDate(timing.startDate),
    endDateLabel: formatEnrollmentDate(timing.endDate),
    availableSeats: getTimingAvailableSeats(timing),
    capacity: timing.capacity,
    enrolledCount: timing.enrolledCount,
  };
}

function buildModeGroupsForBatch(batch: Batch): CourseUpcomingModeGroup[] {
  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

  if (upcomingTimings.length > 0) {
    const grouped = new Map<BatchMode, CourseUpcomingTimingRow[]>();

    upcomingTimings.forEach((timing) => {
      const rows = grouped.get(timing.mode) ?? [];
      rows.push(buildTimingRow(timing));
      grouped.set(timing.mode, rows);
    });

    return COURSE_MODE_ORDER.filter((mode) => grouped.has(mode)).map(
      (mode) => ({
        mode,
        modeLabel: COURSE_MODE_LABELS[mode],
        timings: grouped.get(mode) ?? [],
      }),
    );
  }

  return [
    {
      mode: batch.mode,
      modeLabel: COURSE_MODE_LABELS[batch.mode],
      timings: [
        {
          id: batch.id,
          name: batch.name,
          days: formatBatchDays(batch.daysOfWeek ?? []),
          startTimeLabel: formatEnrollmentTime(batch.startTime),
          endTimeLabel: formatEnrollmentTime(batch.endTime),
          startDateLabel: formatEnrollmentDate(batch.startDate),
          endDateLabel: formatEnrollmentDate(batch.endDate),
          availableSeats: getBatchAvailableSeats(batch),
          capacity: batch.capacity,
          enrolledCount: batch.enrolledCount,
        },
      ],
    },
  ];
}

export function buildCourseUpcomingBatchGroups(
  batches: Batch[],
  courseTitle: string,
): CourseUpcomingBatchGroup[] {
  return batches
    .filter(isUpcomingBatch)
    .map((batch) => {
      const modeGroups = buildModeGroupsForBatch(batch);

      if (modeGroups.length === 0) {
        return null;
      }

      return {
        batchId: batch.id,
        batchName: batch.name,
        batchCode: batch.code,
        courseTitle: batch.course?.title ?? courseTitle,
        modeGroups,
      };
    })
    .filter((row): row is CourseUpcomingBatchGroup => row !== null);
}

export function collectBatchTrainerIds(batches: Batch[]): string[] {
  const ids = new Set<string>();

  batches.filter(isUpcomingBatch).forEach((batch) => {
    batch.trainers?.forEach((trainer) => {
      if (trainer.id) {
        ids.add(trainer.id);
      }
    });
  });

  return Array.from(ids);
}

export function getModePricingRecord(
  batch: Batch,
): Partial<Record<BatchMode, BatchPricing>> {
  if (!batch.modePricing || typeof batch.modePricing !== "object") {
    return {};
  }

  const record: Partial<Record<BatchMode, BatchPricing>> = {};

  Object.entries(batch.modePricing).forEach(([mode, pricing]) => {
    if (isBatchMode(mode) && pricing) {
      record[mode] = normalizeBatchPricing(pricing);
    }
  });

  return record;
}
