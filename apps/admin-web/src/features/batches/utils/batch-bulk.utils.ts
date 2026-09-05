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

/**
 * Bulk batch API handlers return `{ summary: BulkBatchOperationSummary }`
 * (activate/deactivate also include `isActive`). Normalize to the flat
 * summary shape the admin UI expects.
 */
export function unwrapBulkBatchOperationResult(
  data:
    | BulkBatchOperationResult
    | { summary?: BulkBatchOperationResult }
    | null
    | undefined,
): BulkBatchOperationResult {
  if (data && typeof data === "object" && "summary" in data && data.summary) {
    return data.summary;
  }

  if (
    data &&
    typeof data === "object" &&
    "successCount" in data &&
    "failedCount" in data
  ) {
    return {
      requestedCount: data.requestedCount ?? 0,
      processedCount: data.processedCount ?? 0,
      successCount: data.successCount ?? 0,
      failedCount: data.failedCount ?? 0,
      results: data.results ?? [],
      failures: data.failures ?? [],
    };
  }

  return {
    requestedCount: 0,
    processedCount: 0,
    successCount: 0,
    failedCount: 0,
    results: [],
    failures: [],
  };
}

export function formatBulkResultToast(
  result: BulkBatchOperationResult | null | undefined,
  successLabel: string,
): string {
  const summary = unwrapBulkBatchOperationResult(result);
  const successCount = summary.successCount;
  const failedCount = summary.failedCount;
  const failures = summary.failures;

  if (failedCount === 0) {
    return `${successCount} ${successLabel}`;
  }

  const failurePreview = failures
    .slice(0, 2)
    .map((item) => item.message)
    .join(" ");

  return `${successCount} ${successLabel}. ${failedCount} failed.${failurePreview ? ` ${failurePreview}` : ""}`;
}

/** Pick success / warning / error toast based on bulk operation counts. */
export function notifyBulkBatchResult(
  result: BulkBatchOperationResult | null | undefined,
  successLabel: string,
  notify: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
  },
): void {
  const summary = unwrapBulkBatchOperationResult(result);
  const message = formatBulkResultToast(summary, successLabel);

  if (summary.failedCount === 0) {
    notify.success(message);
    return;
  }

  if (summary.successCount === 0) {
    notify.error(message);
    return;
  }

  notify.warning(message);
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
