"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import { GripVertical } from "lucide-react";

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

  actionsDisabled?: boolean;

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
  actionsDisabled = false,
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

  useEffect(() => {
    setRows(categories);
  }, [categories]);

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
      reorderDisabled
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

  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
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
            !reorderDisabled &&
            !isSavingOrder;

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
