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

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

const iconButtonClass =
  "inline-flex h-6 w-6 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[17px] w-[16px] stroke-[2.25]";

interface Props {
  category: CategoryListItem;
  disabled?: boolean;
  onEdit: (category: CategoryListItem) => void;
  onActivate: (category: CategoryListItem) => void;
  onDeactivate: (category: CategoryListItem) => void;
  onDelete: (category: CategoryListItem) => void;
  onRestore: (category: CategoryListItem) => void;
  onPermanentDelete: (category: CategoryListItem) => void;
}

export function CategoryActions({
  category,
  disabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const isArchived =
    category.isDeleted || category.status === "ARCHIVED";

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1.5">
        <Tooltip content="Restore category">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onRestore(category)}
            aria-label="Restore category"
            className={`${iconButtonClass} text-green-800`}
          >
            <RotateCcw className={iconClass} />
          </button>
        </Tooltip>

        <Tooltip content="Permanently delete">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onPermanentDelete(category)}
            aria-label="Permanently delete category"
            className={`${iconButtonClass} text-red-800`}
          >
            <Trash2 className={iconClass} />
          </button>
        </Tooltip>
      </div>
    );
  }

  const isActive = category.status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-1.5">
      <Tooltip content="Edit category">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onEdit(category)}
          aria-label="Edit category"
          className={`${iconButtonClass} text-blue-900`}
        >
          <Pencil className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip
        content={
          isActive
            ? "Deactivate category"
            : "Activate category"
        }
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() =>
            isActive
              ? onDeactivate(category)
              : onActivate(category)
          }
          aria-label={
            isActive
              ? "Deactivate category"
              : "Activate category"
          }
          className={`${iconButtonClass} ${
            isActive ? "text-orange-700" : "text-green-800"
          }`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="Archive category">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onDelete(category)}
          aria-label="Archive category"
          className={`${iconButtonClass} text-red-800`}
        >
          <Archive className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
