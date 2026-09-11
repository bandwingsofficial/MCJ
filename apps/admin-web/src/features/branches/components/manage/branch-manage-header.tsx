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

export function BranchManageHeader({
  branch,
  activeSection,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(branch.deletedAt);
  const location = [branch.city, branch.state].filter(Boolean).join(", ");
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
        <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
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

              <p className="mt-1 text-sm text-[#647A9B]">
                {[branch.branchCode, location].filter(Boolean).join(" · ")}
              </p>

              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Branch Code
                  </dt>
                  <dd className="mt-0.5 font-mono text-sm font-medium text-[#102A56]">
                    {branch.branchCode}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Email
                  </dt>
                  <dd className="mt-0.5 truncate text-sm font-medium text-[#102A56]">
                    {branch.email?.trim() || "—"}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-[#F8FBFF]/60 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Phone
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {branch.phone?.trim() || "—"}
                  </dd>
                </div>
              </dl>

              {address ? (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">
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
