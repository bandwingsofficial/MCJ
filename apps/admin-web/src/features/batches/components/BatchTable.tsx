"use client";

import { useEffect, useRef, useState } from "react";

import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import {
  canReorderBatch,
  isArchivedBatch,
} from "@/src/features/batches/utils/batch-bulk.utils";
import {
  formatBatchDateRange,
  formatBatchTiming,
} from "@/src/features/batches/utils/batch.helper";

import { BatchStatusBadge } from "./BatchStatusBadge";
import { BatchActions } from "./batch-actions";

interface Props {
  batches: BatchListItem[];
  selectedBatchIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyMessage?: string;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
  onEdit: (batch: BatchListItem) => void;
  onManage: (batch: BatchListItem) => void;
  onRestore: (batch: BatchListItem) => void;
  onPermanentDelete: (batch: BatchListItem) => void;
  onReorder: (payload: {
    batchId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
}

export function BatchTable({
  batches,
  selectedBatchIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  emptyMessage = "No batches found.",
  onActivate,
  onDeactivate,
  onEdit,
  onManage,
  onRestore,
  onPermanentDelete,
  onReorder,
}: Props) {
  const [rows, setRows] = useState(batches);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedBatchIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((batch) => batch.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 8 : 7;

  useEffect(() => {
    setRows(batches);
  }, [batches]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (batchId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, batchId]))
      : safeSelectedIds.filter((id) => id !== batchId);

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
      !canReorderBatch(source) ||
      !canReorderBatch(target) ||
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
        batchId: source.id,
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
    reorderDisabled || isSavingOrder || safeSelectedIds.length > 0;

  return (
    <div className="w-full min-w-0">
      <table className="w-full table-fixed border-collapse">
        <colgroup>
          {selectionEnabled ? <col className="w-11" /> : null}
          <col className="w-10" />
          <col className="w-[11%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[26%]" />
          <col className="w-[9%]" />
          <col className="w-[9rem]" />
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
          <tr>
            {selectionEnabled ? (
              <th className="w-11 px-3 py-3 text-left">
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                  checked={allVisibleSelected}
                  disabled={selectionDisabled}
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all batches on this page"
                />
              </th>
            ) : null}

            <th className="w-10 px-2 py-3">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch Code
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Batch Name
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Course
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Schedule
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columnCount}
                className="px-3 py-12 text-center align-middle"
              >
                <p className="text-sm font-medium text-slate-900">
                  {emptyMessage}
                </p>
              </td>
            </tr>
          ) : (
            rows.map((batch) => {
              const draggable = canReorderBatch(batch) && !dragDisabled;
              const isArchived = isArchivedBatch(batch);

              return (
                <tr
                  key={batch.id}
                  draggable={draggable}
                  onDragStart={() => {
                    if (!draggable) {
                      return;
                    }
                    setDragId(batch.id);
                  }}
                  onDragOver={(event) => {
                    if (!draggable || !dragId) {
                      return;
                    }
                    event.preventDefault();
                    setDropTargetId(batch.id);
                  }}
                  onDragLeave={() => {
                    if (dropTargetId === batch.id) {
                      setDropTargetId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleDrop(batch.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropTargetId(null);
                  }}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dropTargetId === batch.id ? "bg-blue-50/60" : ""
                  } ${dragId === batch.id ? "opacity-60" : ""} ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-11 px-3 py-3 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(batch.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(batch.id, Boolean(checked));
                        }}
                      />
                    </td>
                  ) : null}

                  <td className="w-10 px-2 py-3 align-middle">
                    {draggable ? (
                      <GripVertical className="h-4 w-4 cursor-grab text-slate-400 active:cursor-grabbing" />
                    ) : (
                      <span className="inline-block w-4" />
                    )}
                  </td>

                  <td className="truncate px-3 py-3 align-middle font-medium text-slate-900">
                    {batch.code}
                  </td>

                  <td className="truncate px-3 py-3 align-middle font-medium text-slate-900">
                    {batch.name}
                  </td>

                  <td className="truncate px-3 py-3 align-middle text-slate-700">
                    {batch.course?.title?.trim() || "Not yet assigned"}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <div className="min-w-0 flex flex-col gap-0.5 leading-snug">
                      <span className="truncate whitespace-nowrap text-sm text-slate-900">
                        {formatBatchDateRange(batch.startDate, batch.endDate)}
                      </span>
                      <span className="truncate whitespace-nowrap text-sm text-slate-600">
                        {formatBatchTiming(batch.startTime, batch.endTime)}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <BatchStatusBadge
                      isActive={batch.isActive}
                      isDeleted={Boolean(batch.deletedAt || batch.isDeleted)}
                    />
                  </td>

                  <td className="w-[9rem] px-2 py-3 align-middle">
                    <BatchActions
                      batch={batch}
                      disabled={actionsDisabled || isSavingOrder}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onEdit={onEdit}
                      onManage={onManage}
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
