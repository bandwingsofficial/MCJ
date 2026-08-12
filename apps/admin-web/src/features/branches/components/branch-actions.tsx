"use client";

import {
  CircleCheck,
  CircleSlash,
  Eye,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  branch: BranchListItem;

  disabled?: boolean;

  onEdit: (branch: BranchListItem) => void;

  onView: (branch: BranchListItem) => void;

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
  onView,
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
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onRestore(branch)}
          title="Restore branch"
          aria-label="Restore branch"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <RotateCcw className={iconClass} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onView(branch)}
          title="View branch"
          aria-label="View branch"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-slate-800`}
        >
          <Eye className={iconClass} />
        </Button>

        <Dropdown
          trigger={
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="More actions"
              aria-label="More actions"
              className={`${iconBtnClass} text-slate-500 hover:text-slate-700`}
            >
              <MoreHorizontal className={iconClass} />
            </Button>
          }
          items={[
            {
              label: "Permanently Delete",
              destructive: true,
              onClick: () => onPermanentDelete(branch),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onEdit(branch)}
        title="Edit branch"
        aria-label="Edit branch"
      className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
      >
        <Pencil className={iconClass} />
      </Button>

      {branch.status === "ACTIVE" ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(branch)}
          title="Deactivate branch"
          aria-label="Deactivate branch"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <CircleSlash className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(branch)}
          title="Activate branch"
          aria-label="Activate branch"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onView(branch)}
        title="View branch"
        aria-label="View branch"
        className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-slate-800`}
      >
        <Eye className={iconClass} />
      </Button>

      <Dropdown
        trigger={
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            title="More actions"
            aria-label="More actions"
            className={`${iconBtnClass} text-slate-500 hover:text-slate-700`}
          >
            <MoreHorizontal className={iconClass} />
          </Button>
        }
        items={[
          {
            label: "Archive",
            onClick: () => onDelete(branch),
          },
        ]}
      />
    </div>
  );
}
