"use client";

import { CircleCheck, Eye, Power, Trash2 } from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { AdminUserListItem } from "@/src/features/users/services/admin-users.service";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface UserRowActionsProps {
  user: AdminUserListItem;
  disabled?: boolean;
  onView: (user: AdminUserListItem) => void;
  onSuspend: (user: AdminUserListItem) => void;
  onUnsuspend: (user: AdminUserListItem) => void;
  onPermanentDelete: (user: AdminUserListItem) => void;
}

export function UserRowActions({
  user,
  disabled = false,
  onView,
  onSuspend,
  onUnsuspend,
  onPermanentDelete,
}: UserRowActionsProps) {
  if (user.accountStatus === "DELETED") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="View account history">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onView(user)}
            aria-label="View user history"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Eye className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="View user">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onView(user)}
          aria-label="View user"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Eye className={iconClass} />
        </button>
      </Tooltip>

      {user.accountStatus === "ACTIVE" ? (
        <Tooltip content="Suspend user">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onSuspend(user)}
            aria-label="Suspend user"
            className={`${iconButtonClass} text-orange-700`}
          >
            <Power className={iconClass} />
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Unsuspend user">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onUnsuspend(user)}
            aria-label="Unsuspend user"
            className={`${iconButtonClass} text-green-800`}
          >
            <CircleCheck className={iconClass} />
          </button>
        </Tooltip>
      )}

      <Tooltip content="Permanently delete user">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onPermanentDelete(user)}
          aria-label="Permanently delete user"
          className={`${iconButtonClass} text-red-800`}
        >
          <Trash2 className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
