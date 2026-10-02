"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
  isBulkActionEnabledForSelection,
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
  pendingBulkLifecycleCheck?: "deactivate" | "archive" | null;
  onAction: (action: BulkCategoryAction) => void;
}

export function CategoryBulkActionsToolbar({
  categories,
  selectedCategoryIds = [],
  disabled = false,
  pendingBulkLifecycleCheck = null,
  onAction,
}: Props) {
  const selectedCount = selectedCategoryIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    categories,
    selectedCategoryIds,
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    categories,
    selectedCategoryIds,
  ).length;
  const deleteCount = getEligibleDeleteIds(
    categories,
    selectedCategoryIds,
  ).length;
  const restoreCount = getEligibleRestoreIds(
    categories,
    selectedCategoryIds,
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    categories,
    selectedCategoryIds,
  ).length;

  const checkingDeactivate = pendingBulkLifecycleCheck === "deactivate";
  const checkingArchive = pendingBulkLifecycleCheck === "archive";
  const bulkCheckInFlight = pendingBulkLifecycleCheck !== null;

  const activateEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    activateCount,
  );
  const deactivateEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    deactivateCount,
  );
  const deleteEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    deleteCount,
  );
  const restoreEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    restoreCount,
  );
  const permanentDeleteEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    permanentDeleteCount,
  );

  return (
    <div className="flex flex-col gap-1.5 border-b border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium text-slate-800">
        {selectedCount} categor{selectedCount === 1 ? "y" : "ies"} selected
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || !activateEnabled || bulkCheckInFlight}
          onClick={() => onAction("activate")}
        >
          Activate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={
            disabled || !deactivateEnabled || bulkCheckInFlight
          }
          aria-busy={checkingDeactivate}
          onClick={() => onAction("deactivate")}
        >
          {checkingDeactivate ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Deactivate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={disabled || !deleteEnabled || bulkCheckInFlight}
          aria-busy={checkingArchive}
          onClick={() => onAction("delete")}
        >
          {checkingArchive ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Archive
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || !restoreEnabled || bulkCheckInFlight}
          onClick={() => onAction("restore")}
        >
          Restore
        </Button>

        <Button
          type="button"
          variant="danger"
          className="h-7 px-2.5 text-xs"
          disabled={
            disabled || !permanentDeleteEnabled || bulkCheckInFlight
          }
          onClick={() => onAction("permanent-delete")}
        >
          Permanent Delete
        </Button>
      </div>
    </div>
  );
}
