"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";
import { courseTitle } from "@/src/features/branch-ops/utils/batch-display";
import { batchManagePath } from "@/src/features/branch-ops/utils/batch-manage.routes";
import type { BatchMode } from "@/src/features/branch-ops/utils/batch-mode.utils";
import { getBatchModes } from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  formatBatchEnrollmentCapacityLabel,
  formatTimingRange,
  getBatchAggregateStats,
} from "@/src/features/branch-ops/utils/batch-timing.utils";

interface Props {
  batch: BatchListItem;
  activeSection?: string;
}

export function BatchManageHeader({ batch, activeSection }: Props) {
  const courseName = courseTitle(batch.course);
  const configuredModes = getBatchModes(batch);
  const aggregateStats = getBatchAggregateStats(batch);
  const enrollmentLabel = formatBatchEnrollmentCapacityLabel(batch);
  const batchManageHref = batchManagePath(batch.id);

  return (
    <div className="space-y-3">
      <Link
        href="/batches"
        className="inline-flex items-center text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8]"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Back to Batches
      </Link>

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
        <ChevronRight
          className="h-3.5 w-3.5 text-slate-400"
          aria-hidden="true"
        />
        <Link
          href={batchManageHref}
          className="font-medium text-[#647A9B] transition-colors hover:text-[#2563EB]"
        >
          {batch.name} ({batch.code})
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Management</span>
        {activeSection ? (
          <>
            <ChevronRight
              className="h-3.5 w-3.5 text-slate-400"
              aria-hidden="true"
            />
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
                <BatchStatusBadge status={batch.status} />
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
                  <BatchModeBadge mode={batch.mode as BatchMode} />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TimingHeaderProps {
  batch: BatchListItem;
  timing: BatchTimingListItem;
  activeSection?: string;
}

export function BatchTimingManageHeader({
  batch,
  timing,
  activeSection,
}: TimingHeaderProps) {
  const mode = timing.mode as BatchMode;

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
        <Link
          href={batchManagePath(batch.id)}
          className="font-medium text-[#2563EB] hover:underline"
        >
          {batch.name}
        </Link>
        <span aria-hidden>›</span>
        <BatchModeBadge mode={mode} />
        <span aria-hidden>›</span>
        <span className="font-medium text-slate-700">{timing.name}</span>
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
            {timing.name}
          </h1>
          <p className="mt-1 text-sm text-[#647A9B]">
            {batch.name} · {batch.code} · {courseTitle(batch.course)}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <BatchStatusBadge status={timing.status} isActive={timing.isActive} />
            <BatchModeBadge mode={mode} />
            <span className="text-sm text-[#647A9B]">
              {formatTimingRange(timing)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
