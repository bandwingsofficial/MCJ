"use client";

import { useEffect, useRef, useState } from "react";

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

export function BranchTable({
  branches,
  selectedBranchIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
  emptyMessage = "No branches found.",
  onEdit,
  onManage,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  onPermanentDelete,
}: BranchTableProps) {
  const [rows, setRows] = useState(branches);
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

  const columnCount = selectionEnabled ? 7 : 6;

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
                  aria-label="Select all branches on this page"
                />
              </th>
            ) : null}

            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Code
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Email
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Postal Code
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
                    No Branches Found
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Create your first branch or adjust your filters.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            rows.map((branch) => {
              const isArchived = Boolean(branch.deletedAt);

              return (
                <tr
                  key={branch.id}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                    isArchived ? "bg-slate-50/40" : "bg-white"
                  }`}
                >
                  {selectionEnabled ? (
                    <td className="w-9 !px-6 !py-4 align-middle">
                      <Checkbox
                        checked={safeSelectedIds.includes(branch.id)}
                        disabled={selectionDisabled}
                        onCheckedChange={(checked) => {
                          toggleRow(branch.id, Boolean(checked));
                        }}
                      />
                    </td>
                  ) : null}

                  <td className="!px-4 !py-4 align-middle font-mono text-sm text-slate-700">
                    {branch.branchCode}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <button
                      type="button"
                      className="text-left text-sm font-medium leading-snug text-[#102A56] hover:text-[#2563EB] hover:underline"
                      onClick={() => onManage(branch)}
                    >
                      {branch.branchName}
                    </button>
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {branch.email?.trim() || "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle text-sm tabular-nums text-slate-700">
                    {branch.postalCode?.trim() || "—"}
                  </td>

                  <td className="!px-4 !py-4 align-middle">
                    <BranchStatusBadge
                      status={branch.status}
                      deletedAt={branch.deletedAt}
                    />
                  </td>

                  <td className="!px-8 !py-4 align-middle">
                    <BranchActions
                      branch={branch}
                      disabled={actionsDisabled}
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
