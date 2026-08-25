"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/branches/utils/branch-bulk.utils";

export type BulkBranchAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  branches: BranchListItem[];
  selectedBranchIds: string[];
  disabled?: boolean;
  onAction: (action: BulkBranchAction) => void;
}

export function BranchBulkActionsToolbar({
  branches,
  selectedBranchIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedBranchIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    branches,
    selectedBranchIds
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    branches,
    selectedBranchIds
  ).length;
  const deleteCount = getEligibleDeleteIds(
    branches,
    selectedBranchIds
  ).length;
  const restoreCount = getEligibleRestoreIds(
    branches,
    selectedBranchIds
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    branches,
    selectedBranchIds
  ).length;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2447A8]/20 bg-[#2447A8]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} branch{selectedCount === 1 ? "" : "es"}{" "}
        selected
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
          Archive
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
