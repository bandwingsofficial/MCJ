"use client";

import Link from "next/link";
import { ChevronRight, RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Batch } from "@/src/features/batches/types/batch.types";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import { getBatchModes } from "@/src/features/batches/utils/batch-mode.utils";
import {
  formatBatchEnrollmentCapacityLabel,
  getBatchAggregateStats,
} from "@/src/features/batches/utils/batch-timing.utils";

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
  const configuredModes = getBatchModes(batch);
  const aggregateStats = getBatchAggregateStats(batch);
  const enrollmentLabel = formatBatchEnrollmentCapacityLabel(batch);

  return (
    <div className="space-y-3">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1 text-xs"
      >
        <Link
          href="/batches"
          className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          Batches
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">
          {batch.name} ({batch.code})
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
        <div className="bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB]">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <h1 className="min-w-0 text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                  {batch.name}
                </h1>
                <BatchStatusBadge
                  status={batch.status}
                  isActive={batch.isActive}
                  isDeleted={isArchived}
                  startDate={batch.startDate}
                  endDate={batch.endDate}
                />
              </div>

              <p className="mt-1 text-sm text-[#647A9B]">
                {batch.code} · {courseName}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {configuredModes.length > 0 ? (
                  configuredModes.map((mode) => (
                    <BatchModeBadge key={mode} mode={mode} />
                  ))
                ) : batch.mode ? (
                  <BatchModeBadge mode={batch.mode} />
                ) : null}
              </div>

              <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Batch Timings
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {aggregateStats.totalTimings > 0
                      ? aggregateStats.totalTimings
                      : "—"}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Enrolled / Capacity
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium tabular-nums text-[#102A56]">
                    {enrollmentLabel}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Learning Modes
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {configuredModes.length > 0
                      ? configuredModes.length
                      : batch.mode
                        ? "1"
                        : "—"}
                  </dd>
                </div>
              </dl>

              {batch.description?.trim() ? (
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                  {batch.description.trim()}
                </p>
              ) : null}
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
}
