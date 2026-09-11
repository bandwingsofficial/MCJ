"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { GripVertical } from "lucide-react";

import { appToast } from "@/src/shared/components/ui/toast";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

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
  variant?: "default" | "management";
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
  variant = "default",
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
  const isManagement = variant === "management";

  const tableClassName = isManagement
    ? "w-full min-w-full border-collapse text-sm"
    : "min-w-full border-collapse";

  const theadClassName = isManagement
    ? "sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]"
    : "sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]";

  const headerCellClassName = isManagement
    ? "!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]"
    : "px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500";

  const actionsHeaderClassName = isManagement
    ? "w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500"
    : "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500";

  const reorderHeaderClassName = isManagement ? "w-8 !px-4 !py-4" : "w-[4.5rem] px-3 py-3";

  const bodyCellClassName = isManagement ? "!px-4 !py-4 align-middle" : "px-3 py-3 align-middle";

  const actionsCellClassName = isManagement
    ? "!px-8 !py-4 align-middle"
    : "px-2 py-3 align-middle";

  const reorderCellClassName = isManagement
    ? "w-8 !px-4 !py-4 align-middle"
    : "w-[4.5rem] whitespace-nowrap px-3 py-3 align-middle";

  return (
    <div className={isManagement ? "w-full overflow-x-auto" : "overflow-x-auto"}>
      <table className={tableClassName}>
        <thead className={theadClassName}>
          <tr>
            {showReorderColumn && onReorder ? (
              <th className={reorderHeaderClassName}>
                <span className="sr-only">Order</span>
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(headerCellClassName, column.headerClassName)}
              >
                {column.header}
              </th>
            ))}
            <th className={actionsHeaderClassName}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {localRows.length === 0 ? (
            <tr>
              <td
                colSpan={totalColumns}
                className={isManagement ? "!px-4 !py-4 align-middle" : "px-4 py-10 text-center"}
              >
                {isManagement ? (
                  <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                    <h3 className="text-base font-semibold">
                      {emptyTitle}
                    </h3>
                    <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                      {isTrulyEmpty
                        ? emptyDescription
                        : emptySearchDescription}
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-700">
                      {isTrulyEmpty ? emptyTitle : emptySearchDescription}
                    </p>
                    <p className="mt-1 text-sm text-[#647A9B]">
                      {isTrulyEmpty ? emptyDescription : ""}
                    </p>
                  </>
                )}
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
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50",
                    dragId === row.id && "opacity-60",
                    dropTargetId === row.id &&
                      (isManagement ? "bg-blue-50/60" : "bg-slate-50"),
                  )}
                >
                  {showReorderColumn && onReorder ? (
                    <td className={reorderCellClassName}>
                      <div
                        className={cn(
                          "flex items-center gap-2 text-slate-400",
                          !isManagement && "gap-2",
                        )}
                      >
                        {rowDraggable ? (
                          <GripVertical
                            className={cn(
                              "cursor-grab active:cursor-grabbing",
                              isManagement ? "h-3.5 w-3.5" : "h-4 w-4",
                            )}
                            aria-label="Drag to reorder"
                          />
                        ) : (
                          <span
                            className={cn(
                              "inline-block",
                              isManagement ? "w-3.5" : "h-4 w-4",
                            )}
                          />
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
                      className={cn(bodyCellClassName, column.className)}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  <td className={actionsCellClassName}>
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
