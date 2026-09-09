/**
 * Branch-portal mirror of admin/API batch selection semantics.
 * Keep aligned with apps/api/.../batch-selection.util.ts and
 * apps/admin-web/.../batch-select.utils.ts — do not invent a second rule.
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
  | "ONGOING"
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

export function getBatchSelectionBlockReason(
  batch: BatchLike,
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

  if (batch.status === "EXPIRED") {
    return "EXPIRED";
  }

  return null;
}

export function isBatchBlockedForSelection(batch: BatchLike): boolean {
  return getBatchSelectionBlockReason(batch) !== null;
}

export function isBatchSelectableForAssignment(batch: BatchLike): boolean {
  return !isBatchBlockedForSelection(batch);
}

/**
 * Display status for tables/cards. Uses API-calculated lifecycle status
 * (UPCOMING / ONGOING / EXPIRED) — no frontend date recalculation.
 */
export function getBatchDisplayStatus(batch: BatchLike): BatchDisplayStatus {
  if (batch.status === "CANCELLED") {
    return { key: "CANCELLED", label: "Cancelled", variant: "danger" };
  }

  if (batch.status === "COMPLETED") {
    return { key: "COMPLETED", label: "Completed", variant: "default" };
  }

  if (batch.status === "EXPIRED") {
    return { key: "EXPIRED", label: "Expired", variant: "default" };
  }

  if (batch.status === "UPCOMING") {
    return { key: "UPCOMING", label: "Upcoming", variant: "info" };
  }

  if (batch.status === "ONGOING") {
    return { key: "ONGOING", label: "Ongoing", variant: "success" };
  }

  if (batch.isDeleted || batch.deletedAt || batch.status === "ARCHIVED") {
    return { key: "ARCHIVED", label: "Archived", variant: "danger" };
  }

  if (batch.isActive === false) {
    return { key: "INACTIVE", label: "Inactive", variant: "danger" };
  }

  return { key: "ACTIVE", label: "Active", variant: "success" };
}

/** True when the API lifecycle status is still UPCOMING (batch not started yet). */
export function isBatchNotYetStarted(
  batch: Pick<BatchLike, "status">,
): boolean {
  return batch.status === "UPCOMING";
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
