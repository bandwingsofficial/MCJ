"use client";

import {
  CircleCheck,
  CircleSlash,
  Settings2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  branch: BranchListItem;

  disabled?: boolean;

  onManage: (branch: BranchListItem) => void;

  onActivate: (branch: BranchListItem) => void;

  onDeactivate: (branch: BranchListItem) => void;
}

export function BranchActions({
  branch,
  disabled = false,
  onManage,
  onActivate,
  onDeactivate,
}: Props) {
  const isArchived = Boolean(branch.deletedAt);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onManage(branch)}
          title="Manage branch"
          aria-label="Manage branch"
          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Settings2 className={iconClass} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
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
        onClick={() => onManage(branch)}
        title="Manage branch"
        aria-label="Manage branch"
        className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
      >
        <Settings2 className={iconClass} />
      </Button>
    </div>
  );
}
