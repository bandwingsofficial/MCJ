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
  getBatchDisplayStatus,
  isBatchSelectableInBulkList,
} from "@/src/features/batches/utils/batch-select.utils";
import { formatBatchDateRange } from "@/src/features/batches/utils/batch.helper";
import {
  formatBatchTimingNames,
  formatBatchTimingsSummary,
} from "@/src/features/batches/utils/batch-timing.utils";

import { BatchStatusBadge } from "./BatchStatusBadge";
import { BatchActions } from "./batch-actions";
import { cn } from "@/src/shared/lib/cn";

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
  const selectableVisibleIds = rows
    .filter((batch) => isBatchSelectableInBulkList(batch))
    .map((batch) => batch.id);
  const visibleIds = rows.map((batch) => batch.id);
  const selectedVisibleCount = selectableVisibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    selectableVisibleIds.length > 0 &&
    selectedVisibleCount === selectableVisibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 7 : 6;

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
      Array.from(new Set([...safeSelectedIds, ...selectableVisibleIds])),
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
                  disabled={
                    selectionDisabled || selectableVisibleIds.length === 0
                  }
                  onChange={(event) => {
                    toggleAllVisible(event.target.checked);
                  }}
                  aria-label="Select all batches on this page"
                />
              </th>
            ) : null}

            <th className="w-8 !px-4 !py-4">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Batch Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Course
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Schedule
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Management
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
                    No Batches Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Create your first batch or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((batch) => {
              const draggable = canReorderBatch(batch) && !dragDisabled;
              const isArchived = isArchivedBatch(batch);
              const displayStatus = getBatchDisplayStatus(batch);
              const rowSelectable = isBatchSelectableInBulkList(batch);
              const isLifecycleBlocked =
                displayStatus.key === "COMPLETED" ||
                displayStatus.key === "EXPIRED" ||
                displayStatus.key === "CANCELLED" ||
                displayStatus.key === "ARCHIVED";

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
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
                    dropTargetId === batch.id && "bg-blue-50/60",
                    dragId === batch.id && "opacity-60",
                    isLifecycleBlocked || isArchived
                      ? "bg-slate-50/40 text-slate-500"
                      : "bg-white",
                  )}
                >
                  {selectionEnabled ? (
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(batch.id)}
                        disabled={selectionDisabled || !rowSelectable}
                        onCheckedChange={(checked) => {
                          if (!rowSelectable) {
                            return;
                          }
                          toggleRow(batch.id, Boolean(checked));
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

                  <td
                    className={cn(
                      "!px-4 !py-4 align-middle",
                      isLifecycleBlocked ? "text-slate-400" : "",
                    )}
                  >
                    <p
                      className={cn(
                        "truncate text-sm font-medium leading-snug",
                        isLifecycleBlocked
                          ? "text-slate-400"
                          : "text-[#102A56]",
                      )}
                      title={batch.name}
                    >
                      {batch.name}
                    </p>
                  </td>

                  <td
                    className={cn(
                      "!px-4 !py-4 align-middle text-sm",
                      isLifecycleBlocked ? "text-slate-400" : "text-slate-700",
                    )}
                    title={batch.course?.title?.trim() || "Not yet assigned"}
                  >
                    {batch.course?.title?.trim() || "Not yet assigned"}
                  </td>

                  <td
                    className={cn(
                      "!px-4 !py-4 align-middle text-sm",
                      isLifecycleBlocked ? "text-slate-400" : "text-slate-700",
                    )}
                  >
                    <div className="flex min-w-0 flex-col gap-0.5 leading-snug">
                      <span className="truncate">
                        {formatBatchDateRange(batch.startDate, batch.endDate)}
                      </span>
                      <span
                        className="truncate"
                        title={formatBatchTimingNames(batch) || undefined}
                      >
                        {formatBatchTimingsSummary(batch)}
                      </span>
                    </div>
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <BatchStatusBadge
                      displayStatus={displayStatus}
                      isActive={batch.isActive}
                      status={batch.status}
                      isDeleted={Boolean(batch.deletedAt || batch.isDeleted)}
                      startDate={batch.startDate}
                      endDate={batch.endDate}
                    />
                  </td>

                  <td className="!px-8 !py-4 align-middle">
                    <BatchActions
                      batch={batch}
                      disabled={actionsDisabled || isSavingOrder}
                      onActivate={onActivate}
                      onDeactivate={onDeactivate}
                      onEdit={onEdit}
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
