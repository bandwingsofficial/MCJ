import type {
  BulkCommunityOperationResult,
  CommunityPostListItem,
} from "@/src/features/community/types/community.types";

type CommunityArchiveState = Pick<
  CommunityPostListItem,
  "isActive" | "isDeleted"
> & {
  deletedAt?: string | null;
};

export function isArchivedCommunityPost(
  item: CommunityArchiveState,
): boolean {
  return Boolean(item.deletedAt ?? item.isDeleted);
}

export function getEligibleActivateIds(
  items: CommunityPostListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedCommunityPost(item) &&
        !item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleDeactivateIds(
  items: CommunityPostListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedCommunityPost(item) &&
        item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleDeleteIds(
  items: CommunityPostListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) && !isArchivedCommunityPost(item),
    )
    .map((item) => item.id);
}

export function getEligibleRestoreIds(
  items: CommunityPostListItem[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);

  return items
    .filter(
      (item) =>
        selected.has(item.id) && isArchivedCommunityPost(item),
    )
    .map((item) => item.id);
}

export function getEligiblePermanentDeleteIds(
  items: CommunityPostListItem[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(items, selectedIds);
}

export function formatBulkResultToast(
  result: BulkCommunityOperationResult,
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
