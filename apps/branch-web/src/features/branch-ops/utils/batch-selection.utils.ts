/**
 * Branch-portal mirror of admin/API batch selection semantics.
 * Keep aligned with apps/api/.../batch-selection.util.ts —
 * do not invent a second business rule.
 */

export const BLOCKED_BATCH_SELECTION_MESSAGE =
  "Completed or expired batches cannot be selected.";

export type BatchSelectionBlockReason =
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "ARCHIVED"
  | "INACTIVE"
  | null;

export type BatchDisplayStatusKey =
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "ARCHIVED"
  | "INACTIVE"
  | "UPCOMING"
  | "IN_PROGRESS"
  | "ACTIVE";

export interface BatchDisplayStatus {
  key: BatchDisplayStatusKey;
  label: string;
  variant: "success" | "info" | "default" | "danger" | "warning";
}

type BatchLike = {
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return startOfDay(date);
}

export function isBatchDateExpired(
  batch: Pick<BatchLike, "endDate" | "startDate">,
  referenceDate: Date = new Date(),
): boolean {
  const end = parseDate(batch.endDate ?? batch.startDate);
  if (!end) {
    return false;
  }
  return startOfDay(referenceDate).getTime() > end.getTime();
}

export function getBatchSelectionBlockReason(
  batch: BatchLike,
  referenceDate: Date = new Date(),
): BatchSelectionBlockReason {
  if (batch.isDeleted || batch.deletedAt) {
    return "ARCHIVED";
  }

  if (batch.isActive === false) {
    return "INACTIVE";
  }

  if (batch.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (batch.status === "ARCHIVED") {
    return "ARCHIVED";
  }

  if (batch.status === "COMPLETED") {
    return "COMPLETED";
  }

  if (isBatchDateExpired(batch, referenceDate)) {
    return "EXPIRED";
  }

  return null;
}

export function isBatchBlockedForSelection(
  batch: BatchLike,
  referenceDate: Date = new Date(),
): boolean {
  return getBatchSelectionBlockReason(batch, referenceDate) !== null;
}

export function isBatchSelectableForAssignment(
  batch: BatchLike,
  referenceDate: Date = new Date(),
): boolean {
  return !isBatchBlockedForSelection(batch, referenceDate);
}

export function getBatchDisplayStatus(
  batch: BatchLike,
  referenceDate: Date = new Date(),
): BatchDisplayStatus {
  if (batch.isDeleted || batch.deletedAt) {
    return { key: "ARCHIVED", label: "Archived", variant: "danger" };
  }

  if (batch.status === "CANCELLED") {
    return { key: "CANCELLED", label: "Cancelled", variant: "danger" };
  }

  if (batch.status === "ARCHIVED") {
    return { key: "ARCHIVED", label: "Archived", variant: "danger" };
  }

  if (batch.status === "COMPLETED") {
    return { key: "COMPLETED", label: "Completed", variant: "default" };
  }

  if (isBatchDateExpired(batch, referenceDate)) {
    return { key: "EXPIRED", label: "Expired", variant: "default" };
  }

  if (batch.isActive === false) {
    return { key: "INACTIVE", label: "Inactive", variant: "danger" };
  }

  const start = parseDate(batch.startDate);
  const today = startOfDay(referenceDate);
  const notStarted = start ? today.getTime() < start.getTime() : false;

  if (batch.status === "UPCOMING" || notStarted) {
    return { key: "UPCOMING", label: "Upcoming", variant: "info" };
  }

  if (batch.status === "ONGOING") {
    return { key: "IN_PROGRESS", label: "In Progress", variant: "success" };
  }

  return { key: "ACTIVE", label: "Active", variant: "success" };
}

export function isBatchLifecycleGreyed(batch: BatchLike): boolean {
  const key = getBatchDisplayStatus(batch).key;
  return (
    key === "COMPLETED" ||
    key === "EXPIRED" ||
    key === "CANCELLED" ||
    key === "ARCHIVED"
  );
}
