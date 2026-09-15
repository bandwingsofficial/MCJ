"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { GripVertical } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { FinanceNewsListItem } from "@/src/features/finance-news/types/finance-news.types";
import { isArchivedFinanceNews } from "@/src/features/finance-news/utils/finance-news-bulk.utils";
import { getFinanceNewsManagementStatus } from "@/src/features/finance-news/utils/finance-news-display.utils";
import { FINANCE_ARTICLE_STATUS_LABELS } from "@/src/features/finance-news/constants/finance-news.constants";

import { FinanceNewsStatusBadge } from "./finance-news-status-badge";
import { FinanceNewsActions } from "./finance-news-actions";

interface Props {
  items: FinanceNewsListItem[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyMessage?: string;
  onEdit: (item: FinanceNewsListItem) => void;
  onActivate: (item: FinanceNewsListItem) => void;
  onDeactivate: (item: FinanceNewsListItem) => void;
  onDelete: (item: FinanceNewsListItem) => void;
  onRestore: (item: FinanceNewsListItem) => void;
  onPermanentDelete: (item: FinanceNewsListItem) => void;
  onReorder: (payload: {
    id: string;
    newPosition: number;
  }) => Promise<void>;
}

function canReorder(item: FinanceNewsListItem): boolean {
  return (
    !isArchivedFinanceNews(item) &&
    item.isActive &&
    item.displayOrder != null
  );
}

export function FinanceNewsTable({
  items,
  selectedIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  emptyMessage = "No articles found.",
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onReorder,
}: Props) {
  const [rows, setRows] = useState(items);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((item) => item.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 8 : 7;

  useEffect(() => {
    setRows(items);
  }, [items]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (id: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, id]))
      : safeSelectedIds.filter((itemId) => itemId !== id);

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

    onSelectionChange(Array.from(new Set([...safeSelectedIds, ...visibleIds])));
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
    const fromIndex = next.findIndex((item) => item.id === dragId);
    const toIndex = next.findIndex((item) => item.id === targetId);

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

    const newPosition = target.displayOrder;
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setRows(next);

    try {
      setIsSavingOrder(true);
      await onReorder({
        id: source.id,
        newPosition,
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
    reorderDisabled || isSavingOrder || safeSelectedIds.length > 0;

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
                  aria-label="Select all articles on this page"
                />
              </th>
            ) : null}

            <th className="w-8 !px-4 !py-4">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="w-12 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Thumbnail
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Title
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Category
            </th>
            <th className="w-28 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Publish Status
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
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
                    No Articles Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyMessage}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((item) => {
              const draggable = canReorder(item) && !dragDisabled;
              const isArchived = isArchivedFinanceNews(item);
              const managementStatus = getFinanceNewsManagementStatus(item);

              return (
                <tr
                  key={item.id}
                  draggable={draggable}
                  onDragStart={() => {
                    if (!draggable) {
                      return;
                    }
                    setDragId(item.id);
                  }}
                  onDragOver={(event) => {
                    if (!draggable || !dragId) {
                      return;
                    }
                    event.preventDefault();
                    setDropTargetId(item.id);
                  }}
                  onDragLeave={() => {
                    if (dropTargetId === item.id) {
                      setDropTargetId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleDrop(item.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropTargetId(null);
                  }}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dropTargetId === item.id ? "bg-blue-50/60" : ""
                  } ${dragId === item.id ? "opacity-60" : ""} ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(item.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(item.id, Boolean(checked));
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
                    {item.thumbnailUrl ? (
                      <Image
                        src={item.thumbnailUrl}
                        alt={item.title}
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
                      {item.title}
                    </p>
                    {item.slug ? (
                      <p className="mt-0.5 text-xs text-slate-500">
                        {item.slug}
                      </p>
                    ) : null}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {item.category?.name ?? "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <Badge variant="default" className="px-2 py-0 text-[11px] font-semibold leading-5">
                      {FINANCE_ARTICLE_STATUS_LABELS[item.status]}
                    </Badge>
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <FinanceNewsStatusBadge status={managementStatus} />
                  </td>

                  <td className="!px-8 !py-4 align-middle">
                    <FinanceNewsActions
                      item={item}
                      disabled={actionsDisabled || isSavingOrder}
                      onEdit={onEdit}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onDelete={onDelete}
                      onRestore={onRestore}
                      onPermanentDelete={onPermanentDelete}
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
