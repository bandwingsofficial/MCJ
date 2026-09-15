"use client";

import {
  Archive,
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { FinanceNewsListItem } from "@/src/features/finance-news/types/finance-news.types";
import { isArchivedFinanceNews } from "@/src/features/finance-news/utils/finance-news-bulk.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  item: FinanceNewsListItem;
  disabled?: boolean;
  onEdit: (item: FinanceNewsListItem) => void;
  onActivate: (item: FinanceNewsListItem) => void;
  onDeactivate: (item: FinanceNewsListItem) => void;
  onDelete: (item: FinanceNewsListItem) => void;
  onRestore: (item: FinanceNewsListItem) => void;
  onPermanentDelete: (item: FinanceNewsListItem) => void;
}

export function FinanceNewsActions({
  item,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived = isArchivedFinanceNews(item);

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-2">
        <Tooltip content="Restore article">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(item)}
            aria-label="Restore article"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete article">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(item)}
            aria-label="Permanently delete article"
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
      <Tooltip
        content={isActive ? "Deactivate article" : "Activate article"}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(item) : onActivate(item)
          }
          aria-label={isActive ? "Deactivate article" : "Activate article"}
          className={`${iconButtonClass} text-orange-700`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Edit article">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(item)}
          aria-label="Edit article"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip content="Archive article">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(item)}
          aria-label="Archive article"
          className={`${iconButtonClass} text-red-800`}
        >
          <Archive className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
