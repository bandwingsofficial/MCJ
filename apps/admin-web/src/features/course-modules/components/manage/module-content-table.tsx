"use client";

import { useEffect, useMemo, useRef, useState } from "react";

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
import { appToast } from "@/src/shared/components/ui/toast";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export interface ModuleContentRow {
  id: string;
  displayOrder: number;
  isArchived?: boolean;
}

interface Column<T extends ModuleContentRow> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

interface Props<T extends ModuleContentRow> {
  rows: T[];
  columns: Column<T>[];
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: React.ReactNode;
  orderOffset?: number;
  reorderDisabled?: boolean;
  actionsDisabled?: boolean;
  onReorder?: (payload: {
    rowId: string;
    newPosition: number;
  }) => Promise<void>;
  renderActions: (row: T) => React.ReactNode;
}

export function ModuleContentTable<T extends ModuleContentRow>({
  rows,
  columns,
  emptyTitle,
  emptyDescription,
  emptyAction,
  orderOffset = 0,
  reorderDisabled = false,
  actionsDisabled = false,
  onReorder,
  renderActions,
}: Props<T>) {
  const [localRows, setLocalRows] = useState(rows);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const reorderInFlightRef = useRef(false);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const canDrag = useMemo(
    () =>
      Boolean(onReorder) &&
      !reorderDisabled &&
      !actionsDisabled &&
      !isSavingOrder,
    [onReorder, reorderDisabled, actionsDisabled, isSavingOrder],
  );

  const handleDrop = async (targetId: string) => {
    if (
      !onReorder ||
      !dragId ||
      dragId === targetId ||
      !canDrag ||
      reorderInFlightRef.current
    ) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const sourceIndex = localRows.findIndex((row) => row.id === dragId);
    const targetIndex = localRows.findIndex((row) => row.id === targetId);

    if (sourceIndex < 0 || targetIndex < 0) {
      setDragId(null);
      setDropTargetId(null);
      return;
    }

    const previousRows = localRows;
    const nextRows = [...localRows];
    const [moved] = nextRows.splice(sourceIndex, 1);
    nextRows.splice(targetIndex, 0, moved);
    setLocalRows(nextRows);
    setDragId(null);
    setDropTargetId(null);

    const target = rows.find((row) => row.id === targetId);
    if (!target) {
      setLocalRows(previousRows);
      return;
    }

    reorderInFlightRef.current = true;
    setIsSavingOrder(true);

    try {
      await onReorder({
        rowId: dragId,
        newPosition: target.displayOrder,
      });
    } catch (error) {
      setLocalRows(previousRows);
      appToast.error(getErrorMessage(error));
    } finally {
      reorderInFlightRef.current = false;
      setIsSavingOrder(false);
    }
  };

  if (localRows.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="w-[4.5rem]" />
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localRows.map((row, index) => {
            const rowDraggable = canDrag && !row.isArchived;
            const orderLabel = formatContentOrderNumber(
              orderOffset + index + 1,
            );

            return (
              <TableRow
                key={row.id}
                draggable={rowDraggable}
                onDragStart={() => {
                  if (rowDraggable) {
                    setDragId(row.id);
                  }
                }}
                onDragOver={(event) => {
                  if (rowDraggable && dragId && dragId !== row.id) {
                    event.preventDefault();
                    setDropTargetId(row.id);
                  }
                }}
                onDrop={() => {
                  void handleDrop(row.id);
                }}
                onDragEnd={() => {
                  setDragId(null);
                  setDropTargetId(null);
                }}
                className={`${
                  dragId === row.id ? "opacity-60" : ""
                } ${dropTargetId === row.id ? "bg-slate-50" : ""}`}
              >
                <TableCell className="w-[4.5rem] whitespace-nowrap">
                  <div className="flex items-center gap-2 text-slate-400">
                    {rowDraggable ? (
                      <GripVertical
                        className="h-4 w-4 cursor-grab"
                        aria-label="Drag to reorder"
                      />
                    ) : (
                      <span className="inline-block h-4 w-4" />
                    )}
                    <span className="text-xs font-semibold tabular-nums text-slate-500">
                      {orderLabel}
                    </span>
                  </div>
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.render(row)}
                  </TableCell>
                ))}
                <TableCell className="text-right">
                  {renderActions(row)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
