"use client";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

interface Props {
  category: CategoryListItem;

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
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: Props) {
  const items = [];

  if (!category.isDeleted) {
    items.push({
      label: "Edit",
      onClick: () =>
        onEdit(category),
    });

    if (
      category.status ===
      "ACTIVE"
    ) {
      items.push({
        label: "Deactivate",
        onClick: () =>
          onDeactivate(
            category
          ),
      });
    }

    if (
      category.status ===
      "INACTIVE"
    ) {
      items.push({
        label: "Activate",
        onClick: () =>
          onActivate(
            category
          ),
      });
    }

    items.push({
      label: "Delete",
      onClick: () =>
        onDelete(category),
    });
  }

  if (category.isDeleted) {
    items.push({
      label: "Restore",
      onClick: () =>
        onRestore(category),
    });

    items.push({
      label:
        "Permanent Delete",
      onClick: () =>
        onPermanentDelete(
          category
        ),
    });
  }

  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
        >
          Actions
        </Button>
      }
      items={items}
    />
  );
}