import type {
  Batch,
  BatchMode,
  BatchPricing,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchPrice,
  getBatchPricing,
  normalizeBatchPricing,
  type BatchPricing as NormalizedBatchPricing,
} from "@/src/features/batches/utils/batch-pricing.utils";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  isBatchDateExpired,
  isBatchSelectable,
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

export const COURSE_MODE_BADGE_LABELS: Record<BatchMode, string> = {
  OFFLINE: "OFFLINE",
  ONLINE: "ONLINE",
  RECORDED: "SELF-PACED",
};

export interface CourseUpcomingTableRow {
  id: string;
  batchId: string;
  batchName: string;
  batchRowSpan: number;
  isFirstRowInBatch: boolean;
  isFirstRowInModeGroup: boolean;
  mode: BatchMode;
  modeBadgeLabel: string;
  timingName: string;
  startTimeLabel: string;
  endTimeLabel: string;
  showTimingRange: boolean;
  days: string;
  startDateLabel: string;
  feeLabel: string;
  branchId: string | null;
  joinEnabled: boolean;
  timingId: string | null;
}

export interface CourseModeGroupedTimingLine {
  id: string;
  name: string;
  scheduleLabel: string | null;
}

export interface CourseModeGroupedModeRow {
  mode: BatchMode;
  modeBadgeLabel: string;
  daysLabel: string;
  timings: CourseModeGroupedTimingLine[];
}

export interface CourseModeGroupedBatchBlock {
  batchId: string;
  batchHeadline: string;
  startDateLabel: string;
  modeRows: CourseModeGroupedModeRow[];
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

  const status = String(timing.status ?? "").toUpperCase();

  if (status === "CANCELLED" || status === "COMPLETED" || status === "ONGOING") {
    return false;
  }

  if (isBatchDateExpired(timing)) {
    return false;
  }

  return status === "UPCOMING";
}

export function isUpcomingBatch(batch: Batch): boolean {
  if (batch.isDeleted) {
    return false;
  }

  if (batch.status === "CANCELLED" || batch.status === "COMPLETED") {
    return false;
  }

  if (isBatchDateExpired(batch)) {
    return false;
  }

  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

  /*
   * Parent batches may already be ONGOING while still exposing upcoming
   * timings at other branches/slots. Prefer timing eligibility first so
   * those branches are not silently dropped from enrollment.
   */
  if ((batch.timings?.length ?? 0) > 0) {
    return upcomingTimings.length > 0;
  }

  if (batch.status === "ONGOING") {
    return false;
  }

  return batch.status === "UPCOMING";
}

function getBatchAvailableSeats(batch: Batch): number {
  const capacity = Number.isFinite(batch.capacity) ? batch.capacity : 0;
  const enrolled = Number.isFinite(batch.enrolledCount)
    ? batch.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

export function resolveModePricing(
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

function formatModeFeeLabel(pricing: NormalizedBatchPricing): string {
  if (pricing.isFree) {
    return "Free";
  }

  return formatBatchPrice(pricing);
}

function resolveTimingDays(mode: BatchMode, days: string): string {
  if (mode === "RECORDED") {
    return "Flexible Learning";
  }

  return days || "—";
}

function isTimingJoinEnabled(
  batch: Batch,
  timing: Pick<CourseUpcomingTimingRow, "availableSeats" | "id">,
): boolean {
  if (!isBatchSelectable(batch)) {
    return false;
  }

  return timing.availableSeats > 0;
}

function flattenBatchToTableRows(batch: Batch): CourseUpcomingTableRow[] {
  const modeGroups = buildModeGroupsForBatch(batch);
  const flatRows: Omit<
    CourseUpcomingTableRow,
    "batchRowSpan" | "isFirstRowInBatch"
  >[] = [];

  modeGroups.forEach((group) => {
    const pricing = resolveModePricing(batch, group.mode);
    const feeLabel = formatModeFeeLabel(pricing);

    group.timings.forEach((timing, timingIndex) => {
      const showTimingRange =
        group.mode !== "RECORDED" &&
        timing.startTimeLabel !== "—" &&
        timing.endTimeLabel !== "—";

      flatRows.push({
        id: timing.id,
        batchId: batch.id,
        batchName: batch.name,
        isFirstRowInModeGroup: timingIndex === 0,
        mode: group.mode,
        modeBadgeLabel: COURSE_MODE_BADGE_LABELS[group.mode],
        timingName: timing.name,
        startTimeLabel: timing.startTimeLabel,
        endTimeLabel: timing.endTimeLabel,
        showTimingRange,
        days: resolveTimingDays(group.mode, timing.days),
        startDateLabel: timing.startDateLabel,
        feeLabel,
        branchId: batch.branchId,
        joinEnabled: isTimingJoinEnabled(batch, timing),
        timingId: timing.id !== batch.id ? timing.id : null,
      });
    });
  });

  return flatRows.map((row, index) => ({
    ...row,
    batchRowSpan: flatRows.length,
    isFirstRowInBatch: index === 0,
  }));
}

export function buildCourseUpcomingBatchTableRows(
  batches: Batch[],
): CourseUpcomingTableRow[] {
  return batches
    .filter(isUpcomingBatch)
    .flatMap((batch) => flattenBatchToTableRows(batch));
}

function formatBatchMonthHeadline(
  startDate: string,
  title: string,
): string {
  const date = new Date(startDate);
  if (Number.isNaN(date.getTime())) {
    return title;
  }

  const month = date.toLocaleDateString("en-IN", { month: "long" });
  const year = String(date.getFullYear()).slice(-2);
  const safeTitle = title.trim() || "Batch";

  return `${month} '${year} | ${safeTitle}`;
}

function resolveModeDaysLabel(
  mode: BatchMode,
  timings: CourseUpcomingTimingRow[],
): string {
  if (mode === "RECORDED") {
    return "Learn at your own pace";
  }

  const uniqueDays = [
    ...new Set(
      timings
        .map((timing) => timing.days?.trim())
        .filter((days): days is string => Boolean(days) && days !== "—"),
    ),
  ];

  if (uniqueDays.length === 0) {
    return "—";
  }

  if (uniqueDays.length === 1) {
    return uniqueDays[0];
  }

  return uniqueDays[0];
}

function buildModeGroupedTimingLine(
  mode: BatchMode,
  timing: CourseUpcomingTimingRow,
): CourseModeGroupedTimingLine {
  if (mode === "RECORDED") {
    return {
      id: timing.id,
      name: timing.name,
      scheduleLabel: "Lifetime access",
    };
  }

  const hasRange =
    timing.startTimeLabel !== "—" && timing.endTimeLabel !== "—";

  return {
    id: timing.id,
    name: timing.name,
    scheduleLabel: hasRange
      ? `${timing.startTimeLabel} – ${timing.endTimeLabel}`
      : null,
  };
}

function buildModeGroupedBlockForBatch(
  batch: Batch,
): CourseModeGroupedBatchBlock | null {
  const modeGroups = buildModeGroupsForBatch(batch);

  if (modeGroups.length === 0) {
    return null;
  }

  const modeRows: CourseModeGroupedModeRow[] = modeGroups.map((group) => ({
    mode: group.mode,
    modeBadgeLabel: COURSE_MODE_BADGE_LABELS[group.mode],
    daysLabel: resolveModeDaysLabel(group.mode, group.timings),
    timings: group.timings.map((timing) =>
      buildModeGroupedTimingLine(group.mode, timing),
    ),
  }));

  if (modeRows.length === 0) {
    return null;
  }

  const courseTitle = batch.course?.title?.trim() || batch.name;
  const firstUpcomingTiming = (batch.timings ?? []).find(isUpcomingTiming);
  const startDateSource = firstUpcomingTiming?.startDate || batch.startDate;

  return {
    batchId: batch.id,
    batchHeadline: formatBatchMonthHeadline(startDateSource, courseTitle),
    startDateLabel: formatEnrollmentDate(startDateSource),
    modeRows,
  };
}

/**
 * Course Batch Timings tab: one parent-batch block with exactly one row per
 * configured learning mode (Offline / Online / Self-Paced), timings grouped
 * inside each mode cell.
 */
export function buildCourseModeGroupedBatchBlocks(
  batches: Batch[],
): CourseModeGroupedBatchBlock[] {
  return batches
    .filter(isUpcomingBatch)
    .map((batch) => buildModeGroupedBlockForBatch(batch))
    .filter((block): block is CourseModeGroupedBatchBlock => block !== null);
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
