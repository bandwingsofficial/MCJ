"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/community/utils/community-bulk.utils";

export type BulkCommunityAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  items: CommunityPostListItem[];
  selectedIds: string[];
  disabled?: boolean;
  onAction: (action: BulkCommunityAction) => void;
}

export function CommunityBulkActionsToolbar({
  items,
  selectedIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(items, selectedIds).length;
  const deactivateCount = getEligibleDeactivateIds(items, selectedIds).length;
  const deleteCount = getEligibleDeleteIds(items, selectedIds).length;
  const restoreCount = getEligibleRestoreIds(items, selectedIds).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    items,
    selectedIds,
  ).length;

  return (
    <div className="flex flex-col gap-1.5 border-b border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium text-slate-800">
        {selectedCount} post{selectedCount === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || activateCount === 0}
          onClick={() => onAction("activate")}
        >
          Activate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || deactivateCount === 0}
          onClick={() => onAction("deactivate")}
        >
          Deactivate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || deleteCount === 0}
          onClick={() => onAction("delete")}
        >
          Archive
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || restoreCount === 0}
          onClick={() => onAction("restore")}
        >
          Restore
        </Button>

        <Button
          type="button"
          variant="danger"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || permanentDeleteCount === 0}
          onClick={() => onAction("permanent-delete")}
        >
          Permanent Delete
        </Button>
      </div>
    </div>
  );
}
