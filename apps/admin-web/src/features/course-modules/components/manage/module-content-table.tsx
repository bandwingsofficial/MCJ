"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { GripVertical } from "lucide-react";

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
  headerClassName?: string;
  render: (row: T) => React.ReactNode;
}

interface Props<T extends ModuleContentRow> {
  rows: T[];
  columns: Column<T>[];
  emptyTitle: string;
  emptyDescription: string;
  emptySearchDescription?: string;
  sourceCount?: number;
  orderOffset?: number;
  reorderDisabled?: boolean;
  actionsDisabled?: boolean;
  showReorderColumn?: boolean;
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
  emptySearchDescription = "No items match your search or filters.",
  sourceCount,
  orderOffset = 0,
  reorderDisabled = false,
  actionsDisabled = false,
  showReorderColumn = true,
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
      showReorderColumn &&
      !reorderDisabled &&
      !actionsDisabled &&
      !isSavingOrder,
    [onReorder, showReorderColumn, reorderDisabled, actionsDisabled, isSavingOrder],
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

    reorderInFlightRef.current = true;
    setIsSavingOrder(true);

    try {
      await onReorder({
        rowId: dragId,
        newPosition: orderOffset + targetIndex + 1,
      });
    } catch (error) {
      setLocalRows(previousRows);
      appToast.error(getErrorMessage(error));
    } finally {
      reorderInFlightRef.current = false;
      setIsSavingOrder(false);
    }
  };

  const totalColumns =
    columns.length + (showReorderColumn && onReorder ? 1 : 0) + 1;

  const isTrulyEmpty = (sourceCount ?? localRows.length) === 0;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
          <tr>
            {showReorderColumn && onReorder ? (
              <th className="w-[4.5rem] px-3 py-3">
                <span className="sr-only">Order</span>
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${
                  column.headerClassName ?? ""
                }`}
              >
                {column.header}
              </th>
            ))}
            <th className="px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {localRows.length === 0 ? (
            <tr>
              <td colSpan={totalColumns} className="px-4 py-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  {isTrulyEmpty ? emptyTitle : emptySearchDescription}
                </p>
                <p className="mt-1 text-sm text-[#647A9B]">
                  {isTrulyEmpty ? emptyDescription : ""}
                </p>
              </td>
            </tr>
          ) : (
            localRows.map((row, index) => {
              const rowDraggable = canDrag && !row.isArchived;
              const orderLabel = formatContentOrderNumber(
                orderOffset + index + 1,
              );

              return (
                <tr
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
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dragId === row.id ? "opacity-60" : ""
                  } ${dropTargetId === row.id ? "bg-slate-50" : ""}`}
                >
                  {showReorderColumn && onReorder ? (
                    <td className="w-[4.5rem] whitespace-nowrap px-3 py-3 align-middle">
                      <div className="flex items-center gap-2 text-slate-400">
                        {rowDraggable ? (
                          <GripVertical
                            className="h-4 w-4 cursor-grab active:cursor-grabbing"
                            aria-label="Drag to reorder"
                          />
                        ) : (
                          <span className="inline-block h-4 w-4" />
                        )}
                        <span className="text-xs font-semibold tabular-nums text-slate-500">
                          {orderLabel}
                        </span>
                      </div>
                    </td>
                  ) : null}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-3 py-3 align-middle ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  <td className="px-2 py-3 align-middle">
                    <div className="flex items-center justify-end">
                      {renderActions(row)}
                    </div>
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
