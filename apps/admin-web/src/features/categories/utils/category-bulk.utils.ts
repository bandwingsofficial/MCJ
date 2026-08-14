export function isArchivedCategory(category: {
  isDeleted: boolean;
  status: string;
}): boolean {
  return category.isDeleted || category.status === "ARCHIVED";
}

export function getEligibleActivateIds<
  T extends {
    id: string;
    isDeleted: boolean;
    status: string;
  },
>(categories: T[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);

  return categories
    .filter(
      (category) =>
        selected.has(category.id) &&
        !isArchivedCategory(category) &&
        category.status === "INACTIVE"
    )
    .map((category) => category.id);
}

export function getEligibleDeactivateIds<
  T extends {
    id: string;
    isDeleted: boolean;
    status: string;
  },
>(categories: T[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);

  return categories
    .filter(
      (category) =>
        selected.has(category.id) &&
        !isArchivedCategory(category) &&
        category.status === "ACTIVE"
    )
    .map((category) => category.id);
}

export function getEligibleDeleteIds<
  T extends { id: string; isDeleted: boolean; status: string },
>(categories: T[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);

  return categories
    .filter(
      (category) =>
        selected.has(category.id) && !isArchivedCategory(category)
    )
    .map((category) => category.id);
}

export function getEligibleRestoreIds<
  T extends { id: string; isDeleted: boolean; status: string },
>(categories: T[], selectedIds: string[]): string[] {
  const selected = new Set(selectedIds);

  return categories
    .filter(
      (category) =>
        selected.has(category.id) && isArchivedCategory(category)
    )
    .map((category) => category.id);
}

export function getEligiblePermanentDeleteIds<
  T extends { id: string; isDeleted: boolean; status: string },
>(categories: T[], selectedIds: string[]): string[] {
  return getEligibleRestoreIds(categories, selectedIds);
}

export function formatBulkResultToast(
  result: {
    successCount: number;
    failedCount: number;
    failures: { message: string }[];
  },
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
