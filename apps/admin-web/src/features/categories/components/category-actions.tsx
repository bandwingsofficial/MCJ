"use client";

import {
  Archive,
  CircleCheck,
  Pencil,
  Power,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";

const iconClass = "h-[1.25rem] w-[1.25rem]";

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
      <div className="flex items-center justify-end gap-1">
        <Tooltip content="Restore category">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onRestore(category)}
            aria-label="Restore category"
            className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
          >
            <RotateCcw className={iconClass} />
          </Button>
        </Tooltip>

        <Tooltip content="Permanently delete">
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={() => onPermanentDelete(category)}
            aria-label="Permanently delete category"
            className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
          >
            <Trash2 className={iconClass} />
          </Button>
        </Tooltip>
      </div>
    );
  }

  const isActive = category.status === "ACTIVE";

  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip content="Edit category">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onEdit(category)}
          aria-label="Edit category"
          className={`${iconBtnClass} text-[#2563EB] hover:bg-blue-50 hover:text-[#1E3A8A]`}
        >
          <Pencil className={iconClass} />
        </Button>
      </Tooltip>

      <Tooltip content={isActive ? "Deactivate category" : "Activate category"}>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            isActive ? onDeactivate(category) : onActivate(category)
          }
          aria-label={
            isActive ? "Deactivate category" : "Activate category"
          }
          className={`${iconBtnClass} ${
            isActive
              ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700"
              : "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          }`}
        >
          {isActive ? (
            <Power className={iconClass} />
          ) : (
            <CircleCheck className={iconClass} />
          )}
        </Button>
      </Tooltip>

      <Tooltip content="Archive category">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onDelete(category)}
          aria-label="Archive category"
          className={`${iconBtnClass} text-slate-600 hover:bg-slate-100 hover:text-[#102A56]`}
        >
          <Archive className={iconClass} />
        </Button>
      </Tooltip>
    </div>
  );
}
