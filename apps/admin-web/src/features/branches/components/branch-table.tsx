"use client";

import { useEffect, useRef, useState } from "react";

import { GripVertical } from "lucide-react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import type { BranchListItem } from "@/src/features/branches/types/branch.types";

import { BranchStatusBadge } from "./branch-status-badge";
import { BranchActions } from "./branch-actions";

interface BranchTableProps {
  branches: BranchListItem[];
  selectedBranchIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
  reorderDisabled?: boolean;
  emptyMessage?: string;
  onEdit: (branch: BranchListItem) => void;
  onManage: (branch: BranchListItem) => void;
  onActivate: (branch: BranchListItem) => void;
  onDeactivate: (branch: BranchListItem) => void;
  onDelete: (branch: BranchListItem) => void;
  onRestore: (branch: BranchListItem) => void;
  onPermanentDelete: (branch: BranchListItem) => void;
  onReorder: (payload: {
    branchId: string;
    newDisplayOrder: number;
  }) => Promise<void>;
}

function canReorder(branch: BranchListItem): boolean {
  return (
    !branch.deletedAt &&
    branch.status === "ACTIVE" &&
    branch.displayOrder != null
  );
}

export function BranchTable({
  branches,
  selectedBranchIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  reorderDisabled = false,
  emptyMessage = "No branches found.",
  onEdit,
  onManage,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
  onReorder,
}: BranchTableProps) {
  const [rows, setRows] = useState(branches);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedBranchIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((branch) => branch.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  const columnCount = selectionEnabled ? 8 : 7;

  useEffect(() => {
    setRows(branches);
  }, [branches]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected, allVisibleSelected]);

  const toggleRow = (branchId: string, checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    const next = checked
      ? Array.from(new Set([...safeSelectedIds, branchId]))
      : safeSelectedIds.filter((id) => id !== branchId);

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
        branchId: source.id,
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
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
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
                  aria-label="Select all branches on this page"
                />
              </th>
            ) : null}

            <th className="w-10 px-2 py-3">
              <span className="sr-only">Reorder</span>
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Code
            </th>
            <th className="min-w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </th>
            <th className="min-w-[120px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              City
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Order
            </th>
            <th className="w-[10.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                <p className="text-sm font-medium text-[#102A56]">
                  {emptyMessage}
                </p>
              </td>
            </tr>
          ) : (
            rows.map((branch) => {
              const draggable = canReorder(branch) && !dragDisabled;
              const isArchived = Boolean(branch.deletedAt);

              return (
                <tr
                  key={branch.id}
                  draggable={draggable}
                  onDragStart={() => {
                    if (!draggable) {
                      return;
                    }
                    setDragId(branch.id);
                  }}
                  onDragOver={(event) => {
                    if (!draggable || !dragId) {
                      return;
                    }
                    event.preventDefault();
                    setDropTargetId(branch.id);
                  }}
                  onDragLeave={() => {
                    if (dropTargetId === branch.id) {
                      setDropTargetId(null);
                    }
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    void handleDrop(branch.id);
                  }}
                  onDragEnd={() => {
                    setDragId(null);
                    setDropTargetId(null);
                  }}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    dropTargetId === branch.id ? "bg-blue-50/60" : ""
                  } ${dragId === branch.id ? "opacity-60" : ""} ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-11 px-3 py-3 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(branch.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(branch.id, Boolean(checked));
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

                  <td className="px-3 py-3 align-middle text-[15px] font-medium text-[#102A56]">
                    {branch.branchCode}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <button
                      type="button"
                      className="text-left text-[15px] font-medium text-[#2563EB] hover:underline"
                      onClick={() => onManage(branch)}
                    >
                      {branch.branchName}
                    </button>
                  </td>

                  <td className="px-3 py-3 align-middle text-slate-700">
                    {branch.city ?? "—"}
                  </td>

                  <td className="px-3 py-3 align-middle">
                    <BranchStatusBadge
                      status={branch.status}
                      deletedAt={branch.deletedAt}
                    />
                  </td>

                  <td className="px-3 py-3 align-middle text-slate-700">
                    {branch.displayOrder ?? "—"}
                  </td>

                  <td className="px-2 py-3 align-middle">
                    <BranchActions
                      branch={branch}
                      disabled={actionsDisabled || isSavingOrder}
                      onEdit={onEdit}
                      onManage={onManage}
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
