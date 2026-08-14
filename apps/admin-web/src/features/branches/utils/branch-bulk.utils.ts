import type {
  BranchListItem,
  BulkBranchOperationResult,
} from "@/src/features/branches/types/branch.types";

export function isArchivedBranch(
  branch: BranchListItem
): boolean {
  return Boolean(branch.deletedAt);
}

export function getEligibleActivateIds(
  branches: BranchListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return branches
    .filter(
      (branch) =>
        selected.has(branch.id) &&
        !isArchivedBranch(branch) &&
        branch.status === "INACTIVE"
    )
    .map((branch) => branch.id);
}

export function getEligibleDeactivateIds(
  branches: BranchListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return branches
    .filter(
      (branch) =>
        selected.has(branch.id) &&
        !isArchivedBranch(branch) &&
        branch.status === "ACTIVE"
    )
    .map((branch) => branch.id);
}

export function getEligibleDeleteIds(
  branches: BranchListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return branches
    .filter(
      (branch) =>
        selected.has(branch.id) && !isArchivedBranch(branch)
    )
    .map((branch) => branch.id);
}

export function getEligibleRestoreIds(
  branches: BranchListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return branches
    .filter(
      (branch) =>
        selected.has(branch.id) && isArchivedBranch(branch)
    )
    .map((branch) => branch.id);
}

export function getEligiblePermanentDeleteIds(
  branches: BranchListItem[],
  selectedIds: string[]
): string[] {
  return getEligibleRestoreIds(branches, selectedIds);
}

export function formatBulkResultToast(
  result: BulkBranchOperationResult,
  successLabel: string
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
