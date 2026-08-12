"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Branch } from "@/src/features/branches/types/branch.types";
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";

interface Props {
  branch: Branch;
  onEdit: () => void;
  onView: () => void;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function BranchManageHeader({
  branch,
  onEdit,
  onView,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const router = useRouter();
  const isArchived = Boolean(branch.deletedAt);
  const location = [branch.city, branch.state]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-4">
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
      </nav>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {branch.branchName}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-sm font-semibold tracking-wide text-slate-700">
              {branch.branchCode}
            </span>
            <BranchStatusBadge
              status={branch.status}
              deletedAt={branch.deletedAt}
            />
            {location ? (
              <span className="text-sm text-slate-500">
                {location}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/branches")}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Branches
          </Button>

          <Button
            type="button"
            variant="outline"
            disabled={actionsDisabled}
            onClick={onView}
          >
            <Eye className="mr-1.5 h-4 w-4" />
            View Details
          </Button>

          {!isArchived ? (
            <>
              <Button
                type="button"
                disabled={actionsDisabled}
                onClick={onEdit}
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit Branch
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={actionsDisabled}
                onClick={onArchive}
              >
                Archive
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                disabled={actionsDisabled}
                onClick={onRestore}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <RotateCcw className="mr-1.5 h-4 w-4" />
                Restore
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={actionsDisabled}
                onClick={onPermanentDelete}
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Permanently Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
