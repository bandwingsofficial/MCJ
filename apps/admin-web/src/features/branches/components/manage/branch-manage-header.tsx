"use client";

import Link from "next/link";
import { ChevronRight, RotateCcw, Trash2 } from "lucide-react";

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

function displayValue(value?: string | null) {
  if (!value?.trim()) {
    return "—";
  }

  return value.trim();
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
  const address = formatBranchAddressLine(branch);

  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        <Link
          href="/branches"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Branches
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">
          {branch.branchName} ({branch.branchCode})
        </span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                  {branch.branchName}
                </h1>
                <BranchStatusBadge
                  status={branch.status}
                  deletedAt={branch.deletedAt}
                />
              </div>

              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-snug text-[#102A56]">
                <span>
                  <span className="text-[#647A9B]">Branch Code: </span>
                  <span className="font-mono font-medium">{branch.branchCode}</span>
                </span>
                <span className="text-[#647A9B]" aria-hidden="true">
                  •
                </span>
                <span className="min-w-0">
                  <span className="text-[#647A9B]">Email: </span>
                  <span className="font-medium break-all">
                    {displayValue(branch.email)}
                  </span>
                </span>
                <span className="text-[#647A9B]" aria-hidden="true">
                  •
                </span>
                <span>
                  <span className="text-[#647A9B]">Phone: </span>
                  <span className="font-medium">{displayValue(branch.phone)}</span>
                </span>
              </p>

              {address ? (
                <p className="mt-2 text-sm leading-relaxed text-[#526581]">
                  {address}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col lg:items-end">
              {isArchived ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    disabled={actionsDisabled}
                    onClick={onRestore}
                    className="h-9 justify-center border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4 shrink-0" />
                    Restore
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={actionsDisabled}
                    onClick={onPermanentDelete}
                    className="h-9 justify-center"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
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
                  className="h-9 justify-center border-amber-200 text-amber-800 hover:bg-amber-50"
                >
                  <Trash2 className="mr-1.5 h-4 w-4 shrink-0" />
                  Archive
                </Button>
              )}
            </div>
          </div>
      </div>
    </div>
  );
}

function formatBranchAddressLine(branch: Branch): string {
  return [
    branch.addressLine1,
    branch.addressLine2,
    branch.city,
    branch.state,
    branch.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}
