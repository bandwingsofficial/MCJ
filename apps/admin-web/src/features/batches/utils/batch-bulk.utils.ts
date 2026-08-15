import type {
  BatchListItem,
  BulkBatchOperationResult,
} from "@/src/features/batches/types/batch.types";

export function isArchivedBatch(batch: BatchListItem): boolean {
  return Boolean(batch.deletedAt || batch.isDeleted);
}

export function getEligibleActivateIds(
  batches: BatchListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return batches
    .filter(
      (batch) =>
        selected.has(batch.id) &&
        !isArchivedBatch(batch) &&
        batch.isActive === false,
    )
    .map((batch) => batch.id);
}

export function getEligibleDeactivateIds(
  batches: BatchListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return batches
    .filter(
      (batch) =>
        selected.has(batch.id) &&
        !isArchivedBatch(batch) &&
        batch.isActive !== false,
    )
    .map((batch) => batch.id);
}

export function getEligibleDeleteIds(
  batches: BatchListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return batches
    .filter((batch) => selected.has(batch.id) && !isArchivedBatch(batch))
    .map((batch) => batch.id);
}

export function getEligibleRestoreIds(
  batches: BatchListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return batches
    .filter((batch) => selected.has(batch.id) && isArchivedBatch(batch))
    .map((batch) => batch.id);
}

export function getEligiblePermanentDeleteIds(
  batches: BatchListItem[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(batches, selectedIds);
}

export function formatBulkResultToast(
  result: BulkBatchOperationResult,
  successLabel: string,
): string {
  if (result.failedCount === 0) {
    return `${result.successCount} ${successLabel}`;
  }

  const failurePreview = result.failures
    .slice(0, 2)
    .map((item) => item.message)
    .join(" ");

  return `${result.successCount} ${successLabel}. ${result.failedCount} failed.${failurePreview ? ` ${failurePreview}` : ""}`;
}

export function formatTrainerNames(batch: BatchListItem): string {
  if (!batch.trainers?.length) {
    return "—";
  }

  const first = batch.trainers[0];
  const firstName = [first.firstName, first.lastName].filter(Boolean).join(" ");

  if (batch.trainers.length === 1) {
    return firstName || "—";
  }

  return `${firstName} +${batch.trainers.length - 1}`;
}

export function canReorderBatch(batch: BatchListItem): boolean {
  return (
    !isArchivedBatch(batch) &&
    batch.isActive !== false &&
    batch.displayOrder != null
  );
}
