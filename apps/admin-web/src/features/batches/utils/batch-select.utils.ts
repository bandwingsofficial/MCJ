import type { SelectOption } from "@/src/shared/components/ui/select";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { calculateBatchProgress } from "@/src/features/batches/utils/batch-progress.utils";

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

  const progress = calculateBatchProgress(
    {
      startDate: batch.startDate,
      endDate: batch.endDate,
      daysOfWeek: [],
      startTime: "09:00",
      endTime: "17:00",
    },
    referenceDate,
  );

  if (progress.isExpired) {
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

/**
 * Row checkboxes on list tables: block completed/expired/cancelled/status-archived
 * from bulk selection, but keep soft-deleted (restore) and inactive (activate) selectable.
 */
export function isBatchSelectableInBulkList(
  batch: BatchLike,
  referenceDate: Date = new Date(),
): boolean {
  if (batch.isDeleted || batch.deletedAt) {
    return true;
  }

  const reason = getBatchSelectionBlockReason(batch, referenceDate);
  if (reason === "INACTIVE") {
    return true;
  }

  return reason === null;
}

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

/**
 * Display status for tables/cards. Prefer lifecycle + calendar over bare "Active".
 * Aligns with {@link getBatchSelectionBlockReason} for completed/expired.
 */
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

  const progress = calculateBatchProgress(
    {
      startDate: batch.startDate,
      endDate: batch.endDate,
      daysOfWeek: [],
      startTime: "09:00",
      endTime: "17:00",
    },
    referenceDate,
  );

  if (progress.isExpired) {
    return { key: "EXPIRED", label: "Expired", variant: "default" };
  }

  if (batch.isActive === false) {
    return { key: "INACTIVE", label: "Inactive", variant: "danger" };
  }

  if (batch.status === "UPCOMING" || progress.isNotStarted) {
    return { key: "UPCOMING", label: "Upcoming", variant: "info" };
  }

  if (batch.status === "ONGOING") {
    return { key: "IN_PROGRESS", label: "In Progress", variant: "success" };
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
  referenceDate: Date = new Date(),
): SelectOption {
  const reason = getBatchSelectionBlockReason(batch, referenceDate);

  return {
    value: batch.id,
    label: formatBatchSelectLabel(batch, reason),
    disabled: reason !== null,
  };
}

export function toBatchSelectOptions(
  batches: Array<BatchLike & { id: string; name: string }>,
  referenceDate: Date = new Date(),
): SelectOption[] {
  return uniqueSelectOptions(
    batches.map((batch) => toBatchSelectOption(batch, referenceDate)),
  );
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
