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
  const isInactive = !archived && category.status === "INACTIVE";

  const canDeactivate = isActive;
  const canActivate = isInactive;
  const canArchive = !archived;
  const canRestore = archived;
  const canPermanentDelete = archived;

  const deactivateChecking =
    pendingLifecycleCheck?.categoryId === category.id &&
    pendingLifecycleCheck.action === "deactivate";
  const archiveChecking =
    pendingLifecycleCheck?.categoryId === category.id &&
    pendingLifecycleCheck.action === "archive";

  const lifecycleDisabled = disabled;

  return (
    <div className="flex items-center justify-end gap-2">
      <Tooltip
        content={
          canDeactivate
            ? "Deactivate category"
            : "Deactivate is only available for active categories"
        }
      >
        <button
          type="button"
          disabled={lifecycleDisabled || !canDeactivate || deactivateChecking}
          aria-busy={deactivateChecking}
          onClick={() => {
            if (!canDeactivate || deactivateChecking) {
              return;
            }
            onDeactivate(category);
          }}
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

      <Tooltip
        content={
          canActivate
            ? "Activate category"
            : "Activate is only available for inactive categories"
        }
      >
        <button
          type="button"
          disabled={lifecycleDisabled || !canActivate}
          onClick={() => {
            if (!canActivate) {
              return;
            }
            onActivate(category);
          }}
          aria-label="Activate category"
          className={`${iconButtonClass} text-green-800`}
        >
          <CircleCheck className={iconClass} />
        </button>
      </Tooltip>

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
          canArchive
            ? "Archive category"
            : "Archive is not available for archived categories"
        }
      >
        <button
          type="button"
          disabled={lifecycleDisabled || !canArchive || archiveChecking}
          aria-busy={archiveChecking}
          onClick={() => {
            if (!canArchive || archiveChecking) {
              return;
            }
            onDelete(category);
          }}
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

      <Tooltip
        content={
          canRestore
            ? "Restore category"
            : "Restore is only available for archived categories"
        }
      >
        <button
          type="button"
          disabled={lifecycleDisabled || !canRestore}
          onClick={() => {
            if (!canRestore) {
              return;
            }
            onRestore(category);
          }}
          aria-label="Restore category"
          className={`${iconButtonClass} text-green-800`}
        >
          <RotateCcw className={iconClass} />
        </button>
      </Tooltip>

      <Tooltip
        content={
          canPermanentDelete
            ? "Permanently delete category"
            : "Permanent delete is only available for archived categories"
        }
      >
        <button
          type="button"
          disabled={lifecycleDisabled || !canPermanentDelete}
          onClick={() => {
            if (!canPermanentDelete) {
              return;
            }
            onPermanentDelete(category);
          }}
          aria-label="Permanently delete category"
          className={`${iconButtonClass} text-red-800`}
        >
          <Trash2 className={iconClass} />
        </button>
      </Tooltip>
    </div>
  );
}
