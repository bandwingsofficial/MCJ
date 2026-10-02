"use client";

import {
  Archive,
  CircleCheck,
  Loader2,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { isArchivedCategory } from "@/src/features/categories/utils/category-bulk.utils";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

interface Props {
  category: CategoryListItem;
  disabled?: boolean;
  onEdit: (category: CategoryListItem) => void;
  onActivate: (category: CategoryListItem) => void;
  onDeactivate: (category: CategoryListItem) => void;
  onDelete: (category: CategoryListItem) => void;
  onRestore: (category: CategoryListItem) => void;
  onPermanentDelete: (category: CategoryListItem) => void;
  pendingLifecycleCheck?: {
    categoryId: string;
    action: "deactivate" | "archive";
  } | null;
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
  pendingLifecycleCheck = null,
}: Props) {
  const archived = isArchivedCategory(category);
  const isActive = category.status === "ACTIVE";

  const deactivateChecking =
    pendingLifecycleCheck?.categoryId === category.id &&
    pendingLifecycleCheck.action === "deactivate";
  const archiveChecking =
    pendingLifecycleCheck?.categoryId === category.id &&
    pendingLifecycleCheck.action === "archive";

  if (archived) {
    return (
      <div className="flex items-center justify-end gap-2">
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

        <Tooltip content="Permanently delete category">
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

  return (
    <div className="flex items-center justify-end gap-2">
      {isActive ? (
        <Tooltip content="Deactivate category">
          <button
            type="button"
            disabled={disabled || deactivateChecking}
            aria-busy={deactivateChecking}
            onClick={() => onDeactivate(category)}
            aria-label="Deactivate category"
            className={`${iconButtonClass} text-orange-700`}
          >
            {deactivateChecking ? (
              <Loader2 className={`${iconClass} animate-spin`} aria-hidden />
            ) : (
              <Power className={iconClass} />
            )}
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Activate category">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onActivate(category)}
            aria-label="Activate category"
            className={`${iconButtonClass} text-green-800`}
          >
            <CircleCheck className={iconClass} />
          </button>
        </Tooltip>
      )}

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

      <Tooltip content="Archive category">
        <button
          type="button"
          disabled={disabled || archiveChecking}
          aria-busy={archiveChecking}
          onClick={() => onDelete(category)}
          aria-label="Archive category"
          className={`${iconButtonClass} text-red-800`}
        >
          {archiveChecking ? (
            <Loader2 className={`${iconClass} animate-spin`} aria-hidden />
          ) : (
            <Archive className={iconClass} />
          )}
        </button>
      </Tooltip>
    </div>
  );
}
