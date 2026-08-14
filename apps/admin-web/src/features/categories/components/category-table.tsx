"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { CategoryStatusBadge } from "./category-status-badge";

import { CategoryActions } from "./category-actions";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

interface Props {
  categories: CategoryListItem[];

  selectedCategoryIds?: string[];

  onSelectionChange?: (ids: string[]) => void;

  actionsDisabled?: boolean;

  selectionDisabled?: boolean;

  reorderDisabled?: boolean;

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

  onReorder: (payload: {
    categoryId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
}

function canReorder(
  category: CategoryListItem
): boolean {
  return (
    !category.isDeleted &&
    category.status !== "ARCHIVED" &&
    category.displayOrder != null
  );
}

export function CategoryTable({
  categories,
  selectedCategoryIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onReorder,
}: Props) {
  const [rows, setRows] =
    useState(categories);

  const [dragId, setDragId] =
    useState<string | null>(null);

  const [dropTargetId, setDropTargetId] =
    useState<string | null>(null);

  const [isSavingOrder, setIsSavingOrder] =
    useState(false);

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedCategoryIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((category) => category.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id)
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 &&
    selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setRows(categories);
  }, [categories]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (categoryId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, categoryId]))
      : safeSelectedIds.filter((id) => id !== categoryId);

    onSelectionChange(next);
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    if (!checked) {
      onSelectionChange(
        safeSelectedIds.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds]))
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No Categories Found"
        description="Create your first category."
      />
    );
  }

  const handleDrop = async (
    targetId: string
  ) => {
    if (
      !dragId ||
      dragId === targetId ||
      isSavingOrder ||
      reorderDisabled ||
      safeSelectedIds.length > 0
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previous = rows;
    const next = [...rows];
    const fromIndex = next.findIndex(
      (item) => item.id === dragId
    );
    const toIndex = next.findIndex(
      (item) => item.id === targetId
    );

    if (fromIndex < 0 || toIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const source = next[fromIndex];
    const target = next[toIndex];

    if (
      !canReorder(source) ||
      !canReorder(target) ||
      target.displayOrder == null
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const newDisplayOrder = target.displayOrder;

    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRows(next);

    try {
      setIsSavingOrder(true);
      await onReorder({
        categoryId: source.id,
        newDisplayOrder,
      });
    } catch {
      setRows(previous);
    } finally {
      setIsSavingOrder(false);
      setDragId(null);
      setDropTargetId(null);
    }
  };

  const dragDisabled =
    reorderDisabled ||
    isSavingOrder ||
    safeSelectedIds.length > 0;

  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={allVisibleSelected}
                disabled={selectionDisabled}
                onChange={(event) => {
                  toggleAllVisible(event.target.checked);
                }}
                aria-label="Select all categories on this page"
              />
            </TableHead>
          ) : null}

          <TableHead className="w-10">
            <span className="sr-only">
              Reorder
            </span>
          </TableHead>
          <TableHead>Image</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Slug</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead className="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((category) => {
          const draggable =
            canReorder(category) &&
            !dragDisabled;

          return (
            <TableRow
              key={category.id}
              draggable={draggable}
              onDragStart={() => {
                if (!draggable) {
                  return;
                }
                setDragId(category.id);
              }}
              onDragOver={(event) => {
                if (!draggable || !dragId) {
                  return;
                }
                event.preventDefault();
                setDropTargetId(category.id);
              }}
              onDragLeave={() => {
                if (
                  dropTargetId ===
                  category.id
                ) {
                  setDropTargetId(null);
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                void handleDrop(category.id);
              }}
              onDragEnd={() => {
                setDragId(null);
                setDropTargetId(null);
              }}
              className={`${
                dropTargetId === category.id
                  ? "bg-slate-50"
                  : ""
              } ${
                dragId === category.id
                  ? "opacity-60"
                  : ""
              }`}
            >
              {selectionEnabled ? (
                <TableCell className="w-10">
                  <Checkbox
                    checked={safeSelectedIds.includes(
                      category.id
                    )}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) => {
                      toggleRow(category.id, Boolean(checked));
                    }}
                  />
                </TableCell>
              ) : null}

              <TableCell className="w-10">
                {draggable ? (
                  <GripVertical className="h-3.5 w-3.5 cursor-grab text-slate-400" />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
              </TableCell>

              <TableCell>
                {category.thumbnailUrl ? (
                  <Image
                    src={
                      category.thumbnailUrl
                    }
                    alt={
                      category.name
                    }
                    width={40}
                    height={40}
                    className="h-10 w-10 rounded-md border object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-slate-50 text-[11px] text-slate-400">
                    N/A
                  </div>
                )}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                {category.name}
              </TableCell>

              <TableCell>
                {category.slug}
              </TableCell>

              <TableCell>
                <CategoryStatusBadge
                  status={
                    category.status
                  }
                />
              </TableCell>

              <TableCell>
                {category.displayOrder ??
                  "—"}
              </TableCell>

              <TableCell className="text-right">
                <CategoryActions
                  category={category}
                  disabled={
                    actionsDisabled ||
                    isSavingOrder
                  }
                  onEdit={onEdit}
                  onActivate={onActivate}
                  onDeactivate={
                    onDeactivate
                  }
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onPermanentDelete={
                    onPermanentDelete
                  }
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
