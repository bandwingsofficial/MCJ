import type { BatchListItem } from "@/src/features/batches/types/batch.types";

export type BatchLifecycleBlockAction = "deactivate" | "archive";

export interface BatchLifecycleBlockEntry {
  batchId: string;
  batchName: string;
  statusLabel: string;
}

const LIFECYCLE_BLOCK_STATUSES = new Set(["UPCOMING", "ONGOING"]);

export function getBatchLifecycleStatusLabel(
  status: BatchListItem["status"],
): string {
  switch (status) {
    case "UPCOMING":
      return "Upcoming";
    case "ONGOING":
      return "Ongoing";
    case "EXPIRED":
      return "Expired";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

export function isBatchLifecycleBlockingDeactivateOrArchive(
  batch: Pick<BatchListItem, "status">,
): boolean {
  return LIFECYCLE_BLOCK_STATUSES.has(batch.status);
}

export function collectSelectedLifecycleBlocks(
  batches: BatchListItem[],
  selectedBatchIds: string[],
): BatchLifecycleBlockEntry[] {
  const selected = new Set(selectedBatchIds);

  return batches
    .filter(
      (batch) =>
        selected.has(batch.id) &&
        isBatchLifecycleBlockingDeactivateOrArchive(batch),
    )
    .map((batch) => ({
      batchId: batch.id,
      batchName: batch.name,
      statusLabel: getBatchLifecycleStatusLabel(batch.status),
    }))
    .sort((left, right) =>
      left.batchName.localeCompare(right.batchName),
    );
}

export function buildSingleLifecycleBlockedDescription(
  batchName: string,
  statusLabel: string,
  action: BatchLifecycleBlockAction,
): string {
  const verb = action === "deactivate" ? "deactivated" : "archived";
  return `Batch cannot be ${verb} because it is currently ${statusLabel}.`;
}

export function buildBulkLifecycleBlockedDescription(
  entries: BatchLifecycleBlockEntry[],
  action: BatchLifecycleBlockAction,
): string {
  const verb = action === "deactivate" ? "deactivate" : "archive";
  const intro = `Cannot ${verb} the selected batches because the following batches are Upcoming/Ongoing:`;

  const lines = entries.map(
    (entry) => `${entry.batchName} — ${entry.statusLabel}`,
  );

  return [intro, "", ...lines].join("\n");
}

export function buildLifecycleBlockedDialogTitle(
  action: BatchLifecycleBlockAction,
  bulk: boolean,
): string {
  if (bulk) {
    return action === "deactivate"
      ? "Cannot deactivate selected batches"
      : "Cannot archive selected batches";
  }

  return action === "deactivate"
    ? "Cannot deactivate batch"
    : "Cannot archive batch";
}
