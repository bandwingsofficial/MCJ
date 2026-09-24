"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { isArchivedBatch } from "@/src/features/batches/utils/batch-bulk.utils";
import {
  getBatchDisplayStatus,
  isBatchSelectableInBulkList,
} from "@/src/features/batches/utils/batch-select.utils";
import { formatBatchDateRange } from "@/src/features/batches/utils/batch.helper";
import {
  formatBatchTimingNames,
  formatBatchTimingsSummary,
  getBatchListStudentCount,
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
  emptyMessage?: string;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
  onEdit: (batch: BatchListItem) => void;
  onRestore: (batch: BatchListItem) => void;
  onPermanentDelete: (batch: BatchListItem) => void;
}

export function BatchTable({
  batches,
  selectedBatchIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  emptyMessage = "No batches found.",
  onActivate,
  onDeactivate,
  onEdit,
  onRestore,
  onPermanentDelete,
}: Props) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedBatchIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const selectableVisibleIds = batches
    .filter((batch) => isBatchSelectableInBulkList(batch))
    .map((batch) => batch.id);
  const visibleIds = batches.map((batch) => batch.id);
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
              Students
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
          {batches.length === 0 ? (
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
                    {emptyMessage}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            batches.map((batch) => {
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
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
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

                  <td
                    className={cn(
                      "!px-4 !py-4 align-middle text-sm tabular-nums",
                      isLifecycleBlocked ? "text-slate-400" : "text-slate-700",
                    )}
                  >
                    {getBatchListStudentCount(batch)}
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
                      disabled={actionsDisabled}
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
