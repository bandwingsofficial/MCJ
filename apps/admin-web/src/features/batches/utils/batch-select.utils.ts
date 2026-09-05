import type { SelectOption } from "@/src/shared/components/ui/select";

import type { Batch } from "@/src/features/batches/types/batch.types";

export const BLOCKED_BATCH_SELECTION_MESSAGE =
  "Completed or expired batches cannot be selected.";

export type BatchSelectionBlockReason =
  | "COMPLETED"
  | "EXPIRED"
  | "CANCELLED"
  | "ARCHIVED"
  | "INACTIVE"
  | null;

type BatchLike = Pick<
  Batch,
  "status" | "startDate" | "endDate" | "isActive" | "isDeleted" | "deletedAt"
> & {
  name?: string;
  code?: string | null;
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
 * Row checkboxes on list tables: allow lifecycle batches (including Expired)
 * to be selected for Archive / Activate / Deactivate. Soft-deleted rows stay
 * selectable for Restore / Permanent Delete. Block cancelled / completed.
 */
export function isBatchSelectableInBulkList(batch: BatchLike): boolean {
  if (batch.isDeleted || batch.deletedAt) {
    return true;
  }

  const reason = getBatchSelectionBlockReason(batch);

  if (reason === "INACTIVE" || reason === "EXPIRED" || reason === null) {
    return true;
  }

  return false;
}

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

/**
 * Display status for tables/cards. Uses API-calculated lifecycle status
 * (UPCOMING / ONGOING / EXPIRED) — no frontend date recalculation.
 * Soft-delete (archive) is separate and does not replace lifecycle status.
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

  // Soft-deleted rows may still carry a legacy stored ARCHIVED enum;
  // prefer inactive / active fallbacks only when lifecycle is unknown.
  if (batch.isDeleted || batch.deletedAt || batch.status === "ARCHIVED") {
    return { key: "ARCHIVED", label: "Archived", variant: "danger" };
  }

  if (batch.isActive === false) {
    return { key: "INACTIVE", label: "Inactive", variant: "danger" };
  }

  return { key: "ACTIVE", label: "Active", variant: "success" };
}

function blockReasonSuffix(reason: BatchSelectionBlockReason): string {
  switch (reason) {
    case "COMPLETED":
      return "Completed";
    case "EXPIRED":
      return "Expired";
    case "CANCELLED":
      return "Cancelled";
    case "ARCHIVED":
      return "Archived";
    case "INACTIVE":
      return "Inactive";
    default:
      return "";
  }
}

export function formatBatchSelectLabel(
  batch: Pick<BatchLike, "name" | "code"> & { name: string },
  reason?: BatchSelectionBlockReason,
): string {
  const base = batch.code ? `${batch.name} (${batch.code})` : batch.name;

  if (!reason) {
    return base;
  }

  const suffix = blockReasonSuffix(reason);
  return suffix ? `${base} — ${suffix}` : base;
}

export function toBatchSelectOption(
  batch: BatchLike & { id: string; name: string },
): SelectOption {
  const reason = getBatchSelectionBlockReason(batch);

  return {
    value: batch.id,
    label: formatBatchSelectLabel(batch, reason),
    disabled: reason !== null,
  };
}

export function toBatchSelectOptions(
  batches: Array<BatchLike & { id: string; name: string }>,
): SelectOption[] {
  return uniqueSelectOptions(batches.map((batch) => toBatchSelectOption(batch)));
}

export const BATCH_SELECT_ALL = "ALL";

/** Radix Select cannot use "" as an item value — use this sentinel for "no branch". */
export const BATCH_BRANCH_NONE = "__BATCH_BRANCH_NONE__";

export function uniqueSelectOptions<T extends { label: string; value: string }>(
  options: T[],
): T[] {
  const seen = new Set<string>();

  return options.filter((option) => {
    const value = option.value.trim();

    if (!value) {
      return false;
    }

    if (seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

export function toBranchSelectValue(branchId?: string | null): string {
  return branchId?.trim() ? branchId : BATCH_BRANCH_NONE;
}

export function fromBranchSelectValue(value: string): string {
  return value === BATCH_BRANCH_NONE ? "" : value;
}

export function findBatchById<T extends { id: string }>(
  batches: T[],
  batchId: string,
): T | undefined {
  return batches.find((batch) => batch.id === batchId);
}

export function assertBatchSelectableForSubmit(
  batch: BatchLike | null | undefined,
): batch is BatchLike {
  if (!batch || isBatchBlockedForSelection(batch)) {
    return false;
  }

  return true;
}
