"use client";

import Link from "next/link";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";

interface Props {
  batch: Batch;
  activeSection?: string;
  onArchive: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  actionsDisabled?: boolean;
}

export function BatchManageHeader({
  batch,
  activeSection,
  onArchive,
  onRestore,
  onPermanentDelete,
  actionsDisabled = false,
}: Props) {
  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);
  const courseName = batch.course?.title?.trim() || "No course assigned";

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#647A9B]">
        <Link
          href="/batches"
          className="font-medium text-[#2563EB] hover:underline"
        >
          Batches
        </Link>
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">
          {batch.name} ({batch.code})
        </span>
        <span aria-hidden>›</span>
        <span className="text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <span aria-hidden>›</span>
            <span className="font-medium text-slate-700">{activeSection}</span>
          </>
        ) : null}
      </nav>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-[#102A56] sm:text-2xl">
            {batch.name}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">{courseName}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BatchStatusBadge
              status={batch.status}
              isActive={batch.isActive}
              isDeleted={isArchived}
            />
            <BatchModeBadge mode={batch.mode} />
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
