import type {
  Batch,
  BatchMode,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";
import {
  formatBatchDays,
  formatEnrollmentDate,
  formatEnrollmentTime,
  isBatchDateExpired,
} from "@/src/features/enrollments/utils/enrollment-batch.utils";

export interface BranchBatchTimingLine {
  name: string;
  timeRange: string;
  days: string;
}

export interface BranchBatchModeGroup {
  mode: BatchMode;
  modeLabel: string;
  lines: BranchBatchTimingLine[];
}

export interface BranchParentBatchRow {
  batchId: string;
  batchName: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string | null;
  modeGroups: BranchBatchModeGroup[];
  startDateLabel: string;
  availabilityLabel: string;
  availabilityTone: "success" | "warning" | "muted";
  joinHref: string | null;
}

export interface BranchCourseBatchTab {
  courseId: string;
  courseTitle: string;
  courseSlug: string | null;
  rows: BranchParentBatchRow[];
}

const MODE_ORDER: BatchMode[] = ["OFFLINE", "ONLINE", "RECORDED"];

const MODE_LABELS: Record<BatchMode, string> = {
  OFFLINE: "Offline",
  ONLINE: "Online",
  RECORDED: "Self-Paced",
};

function getTimingAvailableSeats(
  timing: Pick<BatchTiming, "capacity" | "enrolledCount">,
): number {
  const capacity = Number.isFinite(timing.capacity) ? timing.capacity : 0;
  const enrolled = Number.isFinite(timing.enrolledCount)
    ? timing.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

function isUpcomingTiming(timing: BatchTiming): boolean {
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

function getRowAvailability(
  seatCounts: number[],
): Pick<BranchParentBatchRow, "availabilityLabel" | "availabilityTone"> {
  const openSeats = seatCounts.filter((count) => count > 0);

  if (openSeats.length === 0) {
    return { availabilityLabel: "Full", availabilityTone: "muted" };
  }

  if (openSeats.some((count) => count <= 5)) {
    return { availabilityLabel: "Few Seats Left", availabilityTone: "warning" };
  }

  return { availabilityLabel: "Seats Available", availabilityTone: "success" };
}

function buildTimingLine(
  timing: Pick<
    BatchTiming,
    "name" | "startTime" | "endTime" | "daysOfWeek"
  >,
): BranchBatchTimingLine {
  return {
    name: timing.name,
    timeRange: `${formatEnrollmentTime(timing.startTime)} – ${formatEnrollmentTime(timing.endTime)}`,
    days: formatBatchDays(timing.daysOfWeek ?? []),
  };
}

function buildModeGroups(batch: Batch): {
  modeGroups: BranchBatchModeGroup[];
  seatCounts: number[];
} {
  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);

  if (upcomingTimings.length > 0) {
    const grouped = new Map<BatchMode, BranchBatchTimingLine[]>();
    const seatCounts: number[] = [];

    upcomingTimings.forEach((timing) => {
      seatCounts.push(getTimingAvailableSeats(timing));
      const lines = grouped.get(timing.mode) ?? [];
      lines.push(buildTimingLine(timing));
      grouped.set(timing.mode, lines);
    });

    const modeGroups = MODE_ORDER.filter((mode) => grouped.has(mode)).map(
      (mode) => ({
        mode,
        modeLabel: MODE_LABELS[mode],
        lines: grouped.get(mode) ?? [],
      }),
    );

    return { modeGroups, seatCounts };
  }

  const seatCounts = [getBatchAvailableSeatsFromBatch(batch)];
  return {
    modeGroups: [
      {
        mode: batch.mode,
        modeLabel: MODE_LABELS[batch.mode],
        lines: [
          {
            name: batch.name,
            timeRange: `${formatEnrollmentTime(batch.startTime)} – ${formatEnrollmentTime(batch.endTime)}`,
            days: formatBatchDays(batch.daysOfWeek ?? []),
          },
        ],
      },
    ],
    seatCounts,
  };
}

function getBatchAvailableSeatsFromBatch(batch: Batch): number {
  const capacity = Number.isFinite(batch.capacity) ? batch.capacity : 0;
  const enrolled = Number.isFinite(batch.enrolledCount)
    ? batch.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

function buildParentBatchRow(
  batch: Batch,
  courseSlug: string | null,
): BranchParentBatchRow | null {
  if (!isUpcomingBatch(batch) || !batch.courseId) {
    return null;
  }

  const { modeGroups, seatCounts } = buildModeGroups(batch);
  if (modeGroups.length === 0) {
    return null;
  }

  const availability = getRowAvailability(seatCounts);
  const hasOpenSeats = seatCounts.some((count) => count > 0);
  const joinHref =
    courseSlug && hasOpenSeats
      ? `/courses/${encodeURIComponent(courseSlug)}/enroll?batchId=${batch.id}&branchId=${batch.branchId ?? ""}`
      : null;

  const upcomingTimings = (batch.timings ?? []).filter(isUpcomingTiming);
  const startDateSource =
    upcomingTimings[0]?.startDate ?? batch.startDate ?? null;

  return {
    batchId: batch.id,
    batchName: batch.name,
    courseId: batch.courseId,
    courseTitle: batch.course?.title ?? "Course",
    courseSlug,
    modeGroups,
    startDateLabel: formatEnrollmentDate(startDateSource),
    ...availability,
    joinHref,
  };
}

export function buildBranchCourseBatchTabs(
  batches: Batch[],
  courseSlugById: Map<string, string>,
): BranchCourseBatchTab[] {
  const tabs = new Map<string, BranchCourseBatchTab>();

  batches.forEach((batch) => {
    if (!batch.courseId) {
      return;
    }

    const row = buildParentBatchRow(
      batch,
      courseSlugById.get(batch.courseId) ?? null,
    );

    if (!row) {
      return;
    }

    const existing = tabs.get(batch.courseId);
    if (existing) {
      existing.rows.push(row);
      return;
    }

    tabs.set(batch.courseId, {
      courseId: batch.courseId,
      courseTitle: batch.course?.title ?? row.courseTitle,
      courseSlug: courseSlugById.get(batch.courseId) ?? null,
      rows: [row],
    });
  });

  return Array.from(tabs.values()).sort((left, right) =>
    left.courseTitle.localeCompare(right.courseTitle),
  );
}
