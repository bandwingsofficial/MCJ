"use client";

import {
  Archive,
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Settings2,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

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
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = Boolean(branch.deletedAt);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore branch">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(branch)}
            aria-label="Restore branch"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Permanently delete branch">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPermanentDelete(branch)}
            aria-label="Permanently delete branch"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Manage branch">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onManage(branch)}
            aria-label="Manage branch"
            className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
          >
            <Settings2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = branch.status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content={isActive ? "Deactivate branch" : "Activate branch"}>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(branch) : onActivate(branch)
          }
          aria-label={isActive ? "Deactivate branch" : "Activate branch"}
          className={`${iconBtnClass} ${
            isActive
              ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Edit branch">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(branch)}
          aria-label="Edit branch"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Branch management">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(branch)}
          aria-label="Branch management"
          className={`${iconBtnClass} text-slate-700 hover:bg-slate-100 hover:text-slate-900`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content="Archive branch">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDelete(branch)}
          aria-label="Archive branch"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-slate-900`}
        >
          <Archive className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
