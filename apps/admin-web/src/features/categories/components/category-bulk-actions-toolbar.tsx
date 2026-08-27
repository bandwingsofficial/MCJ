"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/categories/utils/category-bulk.utils";

export type BulkCategoryAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  categories: CategoryListItem[];
  selectedCategoryIds: string[];
  disabled?: boolean;
  onAction: (action: BulkCategoryAction) => void;
}

export function CategoryBulkActionsToolbar({
  categories,
  selectedCategoryIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedCategoryIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    categories,
    selectedCategoryIds
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    categories,
    selectedCategoryIds
  ).length;
  const deleteCount = getEligibleDeleteIds(
    categories,
    selectedCategoryIds
  ).length;
  const restoreCount = getEligibleRestoreIds(
    categories,
    selectedCategoryIds
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    categories,
    selectedCategoryIds
  ).length;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} categor{selectedCount === 1 ? "y" : "ies"} selected
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || activateCount === 0}
          onClick={() => onAction("activate")}
        >
          Activate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || deactivateCount === 0}
          onClick={() => onAction("deactivate")}
        >
          Deactivate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || deleteCount === 0}
          onClick={() => onAction("delete")}
        >
          Delete
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || restoreCount === 0}
          onClick={() => onAction("restore")}
        >
          Restore
        </Button>

        <Button
          type="button"
          variant="danger"
          className="h-8"
          disabled={disabled || permanentDeleteCount === 0}
          onClick={() => onAction("permanent-delete")}
        >
          Permanent Delete
        </Button>
      </div>
    </div>
  );
}
