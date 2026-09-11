"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";

import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { BatchModeBadge } from "@/src/features/batches/components/BatchModeBadge";
import {
  batchManagePath,
} from "@/src/features/batches/utils/batch-manage.routes";
import { formatBatchCalendarDate } from "@/src/features/batches/utils/batch-calendar-display.utils";

interface Props {
  batchId: string;
  batchName: string;
  batchCode: string;
  mode: BatchMode;
  modeLabel: string;
  scheduleLabel: string;
  startDate: string;
  endDate: string | null;
}

export function BatchCalendarPageHeader({
  batchId,
  batchName,
  batchCode,
  mode,
  modeLabel,
  scheduleLabel,
  startDate,
  endDate,
}: Props) {
  const dateRangeLabel = endDate
    ? `${formatBatchCalendarDate(startDate)} – ${formatBatchCalendarDate(endDate)}`
    : formatBatchCalendarDate(startDate);

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
        <Link
          href={batchManagePath(batchId)}
          className="font-medium text-slate-700 transition-colors hover:text-[#2563EB]"
        >
          {batchName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-[#102A56]">Calendar</span>
        <ChevronRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
        <span className="font-medium text-slate-700">{modeLabel}</span>
      </nav>

      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB]">
          <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start gap-2">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2563EB] text-white shadow-sm">
                  <CalendarDays className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-bold tracking-tight text-[#102A56] sm:text-2xl">
                    Batch Calendar
                  </h1>
                  <p className="mt-0.5 text-sm text-[#647A9B]">
                    {batchName} · {batchCode}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <BatchModeBadge mode={mode} />
              </div>

              <dl className="mt-3 grid gap-2 sm:grid-cols-3">
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Learning Mode
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {modeLabel}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Working Days
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {scheduleLabel}
                  </dd>
                </div>
                <div className="rounded-lg border border-[#E8F0FA] bg-white/70 px-3 py-2">
                  <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
                    Batch Period
                  </dt>
                  <dd className="mt-0.5 text-sm font-medium text-[#102A56]">
                    {dateRangeLabel}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Link
                href={batchManagePath(batchId)}
                className="inline-flex h-9 items-center rounded-lg border border-[#DCE8F5] bg-white px-3 text-sm font-medium text-[#102A56] transition-colors hover:border-[#2563EB] hover:text-[#2563EB]"
              >
                Back to Batch Management
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
