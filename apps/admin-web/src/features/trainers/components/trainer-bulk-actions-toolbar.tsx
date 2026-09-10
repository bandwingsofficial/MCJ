"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/trainers/utils/trainer-bulk.utils";

export type BulkTrainerAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  trainers: TrainerListItem[];
  selectedTrainerIds: string[];
  disabled?: boolean;
  onAction: (action: BulkTrainerAction) => void;
}

export function TrainerBulkActionsToolbar({
  trainers,
  selectedTrainerIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedTrainerIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    trainers,
    selectedTrainerIds
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    trainers,
    selectedTrainerIds
  ).length;
  const deleteCount = getEligibleDeleteIds(
    trainers,
    selectedTrainerIds
  ).length;
  const restoreCount = getEligibleRestoreIds(
    trainers,
    selectedTrainerIds
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    trainers,
    selectedTrainerIds
  ).length;

  return (
    <div className="flex flex-col gap-1.5 border-b border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium text-slate-800">
        {selectedCount} trainer{selectedCount === 1 ? "" : "s"} selected
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
