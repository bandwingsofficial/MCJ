"use client";

import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Branch } from "@/src/features/branches/types/branch.types";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";

interface Props {
  branch: Branch;
  activeSection?: string;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function BranchManageHeader({
  branch,
  activeSection,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(branch.deletedAt);
  const location = [branch.city, branch.state]
    .filter(Boolean)
    .join(", ");
  const meta = [branch.branchCode, location]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link
          href="/branches"
          className="font-medium text-[#2447A8] hover:underline"
        >
          Branches
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">
          {branch.branchName} ({branch.branchCode})
        </span>
        <span aria-hidden>›</span>
        <span className="text-slate-900">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">
              {activeSection}
            </span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            {branch.branchName}
          </h1>
          {meta ? (
            <p className="mt-1 text-sm text-slate-500">{meta}</p>
          ) : null}
          <div className="mt-2">
            <BranchStatusBadge
              status={branch.status}
              deletedAt={branch.deletedAt}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isArchived ? (
            <>
              <Button
                type="button"
                size="sm"
                disabled={actionsDisabled}
                onClick={onRestore}
                className="border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Restore
              </Button>
              <Button
                type="button"
                size="sm"
                variant="danger"
                disabled={actionsDisabled}
                onClick={onPermanentDelete}
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Permanent Delete
              </Button>
            </>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={actionsDisabled}
              onClick={onArchive}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Archive
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
