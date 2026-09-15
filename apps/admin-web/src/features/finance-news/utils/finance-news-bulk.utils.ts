import type {
  BulkFinanceNewsOperationResult,
  FinanceNewsListItem,
} from "@/src/features/finance-news/types/finance-news.types";

type FinanceNewsArchiveState = Pick<
  FinanceNewsListItem,
  "isActive" | "isDeleted"
> & {
  deletedAt?: string | null;
};

export function isArchivedFinanceNews(
  item: FinanceNewsArchiveState,
): boolean {
  return Boolean(item.deletedAt ?? item.isDeleted);
}

export function getEligibleActivateIds(
  items: FinanceNewsListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedFinanceNews(item) &&
        !item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleDeactivateIds(
  items: FinanceNewsListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedFinanceNews(item) &&
        item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleDeleteIds(
  items: FinanceNewsListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) && !isArchivedFinanceNews(item),
    )
    .map((item) => item.id);
}

export function getEligibleRestoreIds(
  items: FinanceNewsListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) && isArchivedFinanceNews(item),
    )
    .map((item) => item.id);
}

export function getEligiblePermanentDeleteIds(
  items: FinanceNewsListItem[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(items, selectedIds);
}

export function formatBulkResultToast(
  result: BulkFinanceNewsOperationResult,
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
