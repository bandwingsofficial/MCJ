"use client";

import {
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  branch: BranchListItem;
  disabled?: boolean;
  onEdit: (branch: BranchListItem) => void;
  onManage: (branch: BranchListItem) => void;
  onActivate: (branch: BranchListItem) => void;
  onDeactivate: (branch: BranchListItem) => void;
  onDelete: (branch: BranchListItem) => void;
  onRestore: (branch: BranchListItem) => void;
  onPermanentDelete: (branch: BranchListItem) => void;
}

export function BranchActions({
  branch,
  disabled = false,
  onEdit,
  onManage,
  onActivate,
  onDeactivate,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = Boolean(branch.deletedAt);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore branch">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(branch)}
            aria-label="Restore branch"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete branch">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(branch)}
            aria-label="Permanently delete branch"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Manage branch">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onManage(branch)}
            aria-label="Manage branch"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Settings2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = branch.status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content={isActive ? "Deactivate branch" : "Activate branch"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(branch) : onActivate(branch)
          }
          aria-label={isActive ? "Deactivate branch" : "Activate branch"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit branch">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(branch)}
          aria-label="Edit branch"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Manage branch">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onManage(branch)}
          aria-label="Manage branch"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Settings2 className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
