"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

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

  onManage: (branch: BranchListItem) => void;

  onActivate: (branch: BranchListItem) => void;

  onDeactivate: (branch: BranchListItem) => void;

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
  onManage,
  onActivate,
  onDeactivate,
  onReorder,
}: BranchTableProps) {
  const [rows, setRows] = useState(branches);
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<
    string | null
  >(null);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  const safeSelectedIds = selectedBranchIds ?? [];
  const selectionEnabled = Boolean(onSelectionChange);
  const visibleIds = rows.map((branch) => branch.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    safeSelectedIds.includes(id)
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 &&
    selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

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
        safeSelectedIds.filter((id) => !visibleIds.includes(id))
      );
      return;
    }

    onSelectionChange(
      Array.from(new Set([...safeSelectedIds, ...visibleIds]))
    );
  };

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No Branches Found"
        description="Create your first branch to get started."
      />
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
    const fromIndex = next.findIndex(
      (item) => item.id === dragId
    );
    const toIndex = next.findIndex(
      (item) => item.id === targetId
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
    reorderDisabled ||
    isSavingOrder ||
    safeSelectedIds.length > 0;

  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          {selectionEnabled ? (
            <TableHead className="w-10">
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
            </TableHead>
          ) : null}

          <TableHead className="w-10">
            <span className="sr-only">Reorder</span>
          </TableHead>
          <TableHead>Code</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>City</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Order</TableHead>
          <TableHead className="text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {rows.map((branch) => {
          const draggable =
            canReorder(branch) && !dragDisabled;

          return (
            <TableRow
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
              className={`${
                dropTargetId === branch.id
                  ? "bg-slate-50"
                  : ""
              } ${
                dragId === branch.id ? "opacity-60" : ""
              }`}
            >
              {selectionEnabled ? (
                <TableCell className="w-10">
                  <Checkbox
                    checked={safeSelectedIds.includes(
                      branch.id
                    )}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) => {
                      toggleRow(branch.id, checked);
                    }}
                  />
                </TableCell>
              ) : null}

              <TableCell className="w-10">
                {draggable ? (
                  <GripVertical
                    className="h-3.5 w-3.5 cursor-grab text-slate-400"
                    aria-label="Drag to reorder"
                  />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                {branch.branchCode}
              </TableCell>

              <TableCell className="text-[15px] font-medium text-slate-900">
                <button
                  type="button"
                  className="text-left text-[#2447A8] hover:underline"
                  onClick={() => onManage(branch)}
                >
                  {branch.branchName}
                </button>
              </TableCell>

              <TableCell>
                {branch.city ?? "—"}
              </TableCell>

              <TableCell>
                <BranchStatusBadge
                  status={branch.status}
                  deletedAt={branch.deletedAt}
                />
              </TableCell>

              <TableCell>
                {branch.displayOrder ?? "—"}
              </TableCell>

              <TableCell className="text-right">
                <BranchActions
                  branch={branch}
                  disabled={
                    actionsDisabled || isSavingOrder
                  }
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
