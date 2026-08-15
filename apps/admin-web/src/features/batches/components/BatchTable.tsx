"use client";

import { useEffect, useRef, useState } from "react";

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

import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import {
  canReorderBatch,
  isArchivedBatch,
} from "@/src/features/batches/utils/batch-bulk.utils";
import { formatBatchDate } from "@/src/features/batches/utils/batch.helper";

import { BatchStatusBadge } from "./BatchStatusBadge";
import { BatchActions } from "./batch-actions";

interface Props {
  batches: BatchListItem[];
  selectedBatchIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onManage: (batch: BatchListItem) => void;
  onActivate: (batch: BatchListItem) => void;
  onDeactivate: (batch: BatchListItem) => void;
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
  emptyTitle = "No Batches Found",
  emptyDescription = "Create your first batch to get started.",
  onManage,
  onActivate,
  onDeactivate,
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

  if (rows.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

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
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
              <Checkbox
                checked={allVisibleSelected}
                disabled={selectionDisabled}
                onCheckedChange={(checked) =>
                  toggleAllVisible(Boolean(checked))
                }
                aria-label="Select all batches on this page"
              />
            </TableHead>
          ) : null}
          <TableHead className="w-10">
            <span className="sr-only">Reorder</span>
          </TableHead>
          <TableHead>Batch Name</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((batch) => {
          const reorderable = canReorderBatch(batch);
          const isDropTarget = dropTargetId === batch.id;
          const isDragging = dragId === batch.id;

          return (
            <TableRow
              key={batch.id}
              className={
                isDropTarget
                  ? "bg-blue-50/60"
                  : isDragging
                    ? "opacity-60"
                    : undefined
              }
              onDragOver={(event) => {
                if (dragDisabled || !dragId || dragId === batch.id) {
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
            >
              {selectionEnabled ? (
                <TableCell>
                  <Checkbox
                    checked={safeSelectedIds.includes(batch.id)}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) =>
                      toggleRow(batch.id, Boolean(checked))
                    }
                    aria-label={`Select ${batch.name}`}
                  />
                </TableCell>
              ) : null}

              <TableCell>
                {reorderable && !dragDisabled ? (
                  <button
                    type="button"
                    draggable
                    className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                    onDragStart={() => setDragId(batch.id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setDropTargetId(null);
                    }}
                    aria-label={`Reorder ${batch.name}`}
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                ) : (
                  <span className="inline-block w-4" />
                )}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                <div>{batch.name}</div>
                <div className="text-xs font-normal text-slate-500">
                  {batch.code}
                </div>
              </TableCell>

              <TableCell className="text-[15px] text-slate-700">
                {batch.course?.title ?? "—"}
              </TableCell>

              <TableCell className="text-[15px] text-slate-700">
                {formatBatchDate(batch.startDate)}
              </TableCell>

              <TableCell className="text-[15px] text-slate-700">
                {batch.endDate ? formatBatchDate(batch.endDate) : "—"}
              </TableCell>

              <TableCell>
                <BatchStatusBadge
                  status={batch.status}
                  isActive={batch.isActive}
                  isDeleted={isArchivedBatch(batch)}
                />
              </TableCell>

              <TableCell className="text-right">
                <BatchActions
                  batch={batch}
                  disabled={actionsDisabled}
                  onManage={onManage}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
