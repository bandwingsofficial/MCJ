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

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";
import { isArchivedCommunityPost } from "@/src/features/community/utils/community-bulk.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  item: CommunityPostListItem;
  disabled?: boolean;
  onManage: (item: CommunityPostListItem) => void;
  onEdit: (item: CommunityPostListItem) => void;
  onActivate: (item: CommunityPostListItem) => void;
  onDeactivate: (item: CommunityPostListItem) => void;
  onDelete: (item: CommunityPostListItem) => void;
  onRestore: (item: CommunityPostListItem) => void;
  onPermanentDelete: (item: CommunityPostListItem) => void;
}

export function CommunityPostActions({
  item,
  disabled = false,
  onManage,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = isArchivedCommunityPost(item);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Manage post">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onManage(item)}
            aria-label="Manage post"
            className={`${iconButtonClass} text-blue-900`}
          >
            <Settings2 className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Restore post">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(item)}
            aria-label="Restore post"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete post">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(item)}
            aria-label="Permanently delete post"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = item.isActive;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip content="Manage post">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onManage(item)}
          aria-label="Manage post"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Settings2 className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content={isActive ? "Deactivate post" : "Activate post"}>
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(item) : onActivate(item)
          }
          aria-label={isActive ? "Deactivate post" : "Activate post"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit post">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(item)}
          aria-label="Edit post"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Archive post">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(item)}
          aria-label="Archive post"
          className={`${iconButtonClass} text-red-800`}
        >
          <Archive className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
