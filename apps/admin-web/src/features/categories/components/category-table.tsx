"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import { CategoryStatusBadge } from "./category-status-badge";
import { CategoryActions } from "./category-actions";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface Props {
  categories: CategoryListItem[];
  selectedCategoryIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  onEdit: (category: CategoryListItem) => void;
  onActivate: (category: CategoryListItem) => void;
  onDeactivate: (category: CategoryListItem) => void;
  onDelete: (category: CategoryListItem) => void;
  onRestore: (category: CategoryListItem) => void;
  onPermanentDelete: (category: CategoryListItem) => void;
  onReorder: (payload: {
    categoryId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
}

function canReorder(category: CategoryListItem): boolean {
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
  const [rows, setRows] = useState(categories);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedCategoryIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((category) => category.id);
  const columnCount = selectionEnabled ? 9 : 8;

  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
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
        safeSelectedIds.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds])),
    );
  };

  const handleDrop = async (targetId: string) => {
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
      (item) => item.id === dragId,
    );

    const toIndex = next.findIndex(
      (item) => item.id === targetId,
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
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            {selectionEnabled ? (
              <th className="w-9 !px-6 !py-4 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all categories on this page"
                />
              </th>
            ) : null}

            <th className="w-8 !px-4 !py-4">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="w-12 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Image
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Slug
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Total Courses
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">
                    No Categories Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Create your first category or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((category) => {
              const draggable =
                canReorder(category) && !dragDisabled;

              const isArchived =
                category.isDeleted ||
                category.status === "ARCHIVED";

              return (
                <tr
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
                    if (dropTargetId === category.id) {
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
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dropTargetId === category.id
                      ? "bg-blue-50/60"
                      : ""
                  } ${
                    dragId === category.id
                      ? "opacity-60"
                      : ""
                  } ${
                    isArchived
                      ? "bg-slate-50/40"
                      : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(
                          category.id,
                        )}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(
                            category.id,
                            Boolean(checked),
                          );
                        }}
                      />
                    </td>
                  ) : null}
                  <td className="w-8 !px-4 !py-4 align-middle">
                    {draggable ? (
                      <GripVertical className="h-3.5 w-3.5 cursor-grab text-slate-400 active:cursor-grabbing" />
                    ) : (
                      <span className="inline-block w-3.5" />
                    )}
                  </td>
                  <td className="w-12 !px-4 !py-4 align-middle">
                    {category.thumbnailUrl ? (
                      <Image
                        src={category.thumbnailUrl}
                        alt={category.name}
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-md border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-slate-200 bg-slate-50 text-[9px] font-medium uppercase tracking-wide text-slate-400">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-medium leading-snug text-[#102A56]">
                      {category.name}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[12px] text-slate-700">
                      {category.slug}
                    </code>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <CategoryStatusBadge
                      status={category.status}
                    />
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                    {category.courseCount ?? 0}
                  </td>
                  <td className="!px-8 !py-4 align-middle">
                    <CategoryActions
                      category={category}
                      disabled={
                        actionsDisabled || isSavingOrder
                      }
                      onEdit={onEdit}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onDelete={onDelete}
                      onRestore={onRestore}
                      onPermanentDelete={
                        onPermanentDelete
                      }
                    />
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
