"use client";

import {
  KeyRound,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { BranchUserListItem } from "@/src/features/branch-users/types/branch-user.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  branchUser: BranchUserListItem;

  disabled?: boolean;

  onEdit: (branchUser: BranchUserListItem) => void;

  onActivate: (branchUser: BranchUserListItem) => void;

  onDeactivate: (branchUser: BranchUserListItem) => void;

  onDelete: (branchUser: BranchUserListItem) => void;

  onResetPassword: (branchUser: BranchUserListItem) => void;

  onRestore: (branchUser: BranchUserListItem) => void;

  onPermanentDelete: (branchUser: BranchUserListItem) => void;
}

export function BranchUserActions({
  branchUser,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onResetPassword,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isDeleted = Boolean(branchUser.isDeleted);

  if (isDeleted) {
    return (
      <div className="flex items-center justify-end gap-1 whitespace-nowrap">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onRestore(branchUser)}
          title="Restore user"
          aria-label="Restore user"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <RotateCcw className={iconClass} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onPermanentDelete(branchUser)}
          title="Permanently delete user"
          aria-label="Permanently delete user"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Trash2 className={iconClass} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1 whitespace-nowrap">
      {branchUser.isActive ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDeactivate(branchUser)}
          title="Deactivate user"
          aria-label="Deactivate user"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <Power className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onActivate(branchUser)}
          title="Activate user"
          aria-label="Activate user"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <Power className={iconClass} />
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onEdit(branchUser)}
        title="Edit user"
        aria-label="Edit user"
        className={`${iconBtnClass} text-slate-700 hover:bg-slate-100`}
      >
        <Pencil className={iconClass} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onDelete(branchUser)}
        title="Delete user"
        aria-label="Delete user"
        className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
      >
        <Trash2 className={iconClass} />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onResetPassword(branchUser)}
        title="Reset password"
        aria-label="Reset password"
        className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
      >
        <KeyRound className={iconClass} />
      </Button>
    </div>
  );
}
