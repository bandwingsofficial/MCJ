import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

export function isArchivedBatchTiming(template: {
  isDeleted?: boolean;
}): boolean {
  return Boolean(template.isDeleted);
}

export function getEligibleActivateIds(
  templates: BatchTemplate[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);
  return templates
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedBatchTiming(item) &&
        !item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleDeactivateIds(
  templates: BatchTemplate[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);
  return templates
    .filter(
      (item) =>
        selected.has(item.id) &&
        !isArchivedBatchTiming(item) &&
        item.isActive,
    )
    .map((item) => item.id);
}

export function getEligibleArchiveIds(
  templates: BatchTemplate[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);
  return templates
    .filter(
      (item) => selected.has(item.id) && !isArchivedBatchTiming(item),
    )
    .map((item) => item.id);
}

export function getEligibleRestoreIds(
  templates: BatchTemplate[],
  selectedIds: string[],
): string[] {
  const selected = new Set(selectedIds);
  return templates
    .filter(
      (item) => selected.has(item.id) && isArchivedBatchTiming(item),
    )
    .map((item) => item.id);
}

export function getEligiblePermanentDeleteIds(
  templates: BatchTemplate[],
  selectedIds: string[],
): string[] {
  return getEligibleRestoreIds(templates, selectedIds);
}
