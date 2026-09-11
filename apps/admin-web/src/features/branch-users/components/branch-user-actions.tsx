"use client";

import {
  CircleCheck,
  KeyRound,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { BranchUserListItem } from "@/src/features/branch-users/types/branch-user.types";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore user">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(branchUser)}
            aria-label="Restore user"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete user">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(branchUser)}
            aria-label="Permanently delete user"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = branchUser.isActive;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip
        content={isActive ? "Deactivate user" : "Activate user"}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(branchUser) : onActivate(branchUser)
          }
          aria-label={isActive ? "Deactivate user" : "Activate user"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit user">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(branchUser)}
          aria-label="Edit user"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Delete user">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(branchUser)}
          aria-label="Delete user"
          className={`${iconButtonClass} text-red-800`}
        >
          <Trash2 className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Reset password">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onResetPassword(branchUser)}
          aria-label="Reset password"
          className={`${iconButtonClass} text-green-800`}
        >
          <KeyRound className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
