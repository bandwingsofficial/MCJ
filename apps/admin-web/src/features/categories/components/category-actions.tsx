"use client";

import {
  CircleCheck,
  CircleSlash,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

const iconBtnClass =
  "h-10 w-10 shrink-0 rounded-lg p-0";

const iconClass = "h-[1.35rem] w-[1.35rem]";

interface Props {
  category: CategoryListItem;

  disabled?: boolean;

  onEdit: (
    category: CategoryListItem
  ) => void;

  onActivate: (
    category: CategoryListItem
  ) => void;

  onDeactivate: (
    category: CategoryListItem
  ) => void;

  onDelete: (
    category: CategoryListItem
  ) => void;

  onRestore: (
    category: CategoryListItem
  ) => void;

  onPermanentDelete: (
    category: CategoryListItem
  ) => void;
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
    category.isDeleted ||
    category.status === "ARCHIVED";

  if (isArchived) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onRestore(category)
          }
          title="Restore category"
          aria-label="Restore category"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <RotateCcw className={iconClass} />
        </Button>

        <Dropdown
          trigger={
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              title="More actions"
              aria-label="More actions"
              className={`${iconBtnClass} text-slate-500 hover:text-slate-700`}
            >
              <MoreHorizontal className={iconClass} />
            </Button>
          }
          items={[
            {
              label: "Permanently Delete",
              destructive: true,
              onClick: () =>
                onPermanentDelete(
                  category
                ),
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onEdit(category)}
        title="Edit category"
        aria-label="Edit category"
        className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
      >
        <Pencil className={iconClass} />
      </Button>

      {category.status === "ACTIVE" ? (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onDeactivate(category)
          }
          title="Deactivate category"
          aria-label="Deactivate category"
          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
        >
          <CircleSlash className={iconClass} />
        </Button>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() =>
            onActivate(category)
          }
          title="Activate category"
          aria-label="Activate category"
          className={`${iconBtnClass} text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700`}
        >
          <CircleCheck className={iconClass} />
        </Button>
      )}

      <Dropdown
        trigger={
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            title="More actions"
            aria-label="More actions"
            className={`${iconBtnClass} text-slate-500 hover:text-slate-700`}
          >
            <MoreHorizontal className={iconClass} />
          </Button>
        }
        items={[
          {
            label: "Archive",
            onClick: () =>
              onDelete(category),
          },
        ]}
      />
    </div>
  );
}
