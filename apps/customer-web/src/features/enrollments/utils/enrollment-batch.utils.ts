import type {
  Batch,
  BatchStatus,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";

export const BLOCKED_BATCH_SELECTION_MESSAGE =
  "Completed or expired batches cannot be selected.";

const BLOCKED_BATCH_STATUSES: BatchStatus[] = ["COMPLETED", "CANCELLED"];

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isBatchDateExpired(
  batch: Pick<Batch, "endDate" | "startDate">,
  referenceDate: Date = new Date(),
): boolean {
  const end = batch.endDate ?? batch.startDate;
  if (!end) {
    return false;
  }

  const endDate = new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return startOfDay(referenceDate).getTime() > startOfDay(endDate).getTime();
}

export function isBatchBlockedForSelection(batch: Batch): boolean {
  if (batch.isDeleted) {
    return true;
  }

  if (BLOCKED_BATCH_STATUSES.includes(batch.status)) {
    return true;
  }

  return isBatchDateExpired(batch);
}

export function getBatchAvailableSeats(batch: Batch): number {
  const capacity = Number.isFinite(batch.capacity) ? batch.capacity : 0;
  const enrolled = Number.isFinite(batch.enrolledCount)
    ? batch.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

export function getTimingAvailableSeats(
  timing: Pick<BatchTiming, "capacity" | "enrolledCount">,
): number {
  const capacity = Number.isFinite(timing.capacity) ? timing.capacity : 0;
  const enrolled = Number.isFinite(timing.enrolledCount)
    ? timing.enrolledCount
    : 0;

  return Math.max(0, capacity - enrolled);
}

export function isBatchFull(batch: Batch): boolean {
  return getBatchAvailableSeats(batch) <= 0;
}

export function resolveBatchBranchIds(
  batch: Pick<Batch, "branchId" | "assignedBranchIds">,
): string[] {
  const fromAssignments = batch.assignedBranchIds ?? [];
  const ids = [
    ...fromAssignments,
    ...(batch.branchId ? [batch.branchId] : []),
  ].filter(Boolean);

  return Array.from(new Set(ids));
}

export function isBatchAssignedToCourseBranches(
  batch: Pick<Batch, "branchId" | "assignedBranchIds">,
  courseBranchIds: string[],
): boolean {
  if (courseBranchIds.length === 0) {
    return resolveBatchBranchIds(batch).length > 0;
  }

  const allowed = new Set(courseBranchIds);
  return resolveBatchBranchIds(batch).some((branchId) =>
    allowed.has(branchId),
  );
}

export function isBatchAssignedToBranch(
  batch: Pick<Batch, "branchId" | "assignedBranchIds">,
  branchId: string,
): boolean {
  if (!branchId) {
    return false;
  }

  return resolveBatchBranchIds(batch).includes(branchId);
}

export interface BatchSelectionContext {
  branchId?: string | null;
  batchTimingId?: string | null;
}

export function isBatchSelectable(
  batch: Batch,
  context?: BatchSelectionContext,
): boolean {
  if (!batch.courseId) {
    return false;
  }

  if (context?.branchId && !isBatchAssignedToBranch(batch, context.branchId)) {
    return false;
  }

  if (
    !context?.branchId &&
    resolveBatchBranchIds(batch).length === 0
  ) {
    return false;
  }

  if (isBatchBlockedForSelection(batch)) {
    return false;
  }

  if (batch.status !== "UPCOMING") {
    return false;
  }

  const timings = batch.timings ?? [];

  if (context?.batchTimingId && timings.length > 0) {
    const timing = timings.find((row) => row.id === context.batchTimingId);
    if (!timing || !timing.isActive) {
      return false;
    }

    if (
      timing.status === "CANCELLED" ||
      timing.status === "COMPLETED" ||
      timing.status === "ONGOING"
    ) {
      return false;
    }

    if (timing.status !== "UPCOMING") {
      return false;
    }

    if (isBatchDateExpired(timing)) {
      return false;
    }

    return getTimingAvailableSeats(timing) > 0;
  }

  if (timings.length > 0) {
    return timings.some(
      (timing) =>
        timing.isActive &&
        timing.status === "UPCOMING" &&
        !isBatchDateExpired(timing) &&
        getTimingAvailableSeats(timing) > 0,
    );
  }

  return !isBatchFull(batch);
}

export function getBatchSelectionBlockLabel(batch: Batch): string | null {
  if (batch.status === "COMPLETED") {
    return "Completed";
  }

  if (isBatchDateExpired(batch)) {
    return "Expired";
  }

  if (batch.status === "CANCELLED") {
    return "Cancelled";
  }

  if (batch.isDeleted) {
    return "Unavailable";
  }

  return null;
}

export function formatEnrollmentDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatEnrollmentTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = value.split(":");

  if (!hours || !minutes) {
    return value;
  }

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatBatchDays(days: string[]): string {
  if (!days.length) {
    return "—";
  }

  const shortLabels: Record<string, string> = {
    MONDAY: "Mon",
    TUESDAY: "Tue",
    WEDNESDAY: "Wed",
    THURSDAY: "Thu",
    FRIDAY: "Fri",
    SATURDAY: "Sat",
    SUNDAY: "Sun",
  };

  return days.map((day) => shortLabels[day] ?? day).join(" · ");
}

export function getBatchStatusLabel(status: Batch["status"]): string {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatBatchSummaryLabel(batch: Batch | null | undefined): string {
  if (!batch) {
    return "Not selected";
  }

  const name = batch.name?.trim();
  const code = batch.code?.trim();

  if (!name) {
    return code || "Not selected";
  }

  return code ? `${name} · ${code}` : name;
}

export function formatBatchBranchName(batch: Batch | null | undefined): string {
  const branchName = batch?.branch?.branchName?.trim();

  return branchName || "Not assigned";
}
