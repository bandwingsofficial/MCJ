"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type {
  BatchListItem,
  BatchTimingListItem,
} from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  formatTimingDays,
  getBatchDisplayStatus,
} from "@/src/features/branch-ops/utils/batch-display";
import { batchManagePath } from "@/src/features/branch-ops/utils/batch-manage.routes";
import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  batch: BatchListItem;
  timing: BatchTimingListItem;
  parentLabel: string;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#647A9B]">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</dd>
    </div>
  );
}

export function BatchTimingOverviewPanel({ batch, timing }: Props) {
  const display = getBatchDisplayStatus(batch);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Parent batch" value={batch.name} />
          <Field label="Batch timing" value={timing.name} />
          <Field label="Mode" value={formatBatchMode(timing.mode)} />
          <Field label="Working days" value={formatTimingDays(timing.daysOfWeek)} />
          <Field
            label="Schedule"
            value={formatBatchTiming(timing.startTime, timing.endTime)}
          />
          <Field label="Start date" value={formatBatchDate(timing.startDate)} />
          <Field label="End date" value={formatBatchDate(timing.endDate)} />
          <Field label="Capacity" value={String(timing.capacity)} />
          <Field label="Enrolled" value={String(timing.enrolledStudents)} />
          <Field label="Available seats" value={String(timing.availableSeats)} />
          <Field label="Status" value={formatBatchStatus(timing.status)} />
        </dl>
      </div>

      <p className="text-sm text-[#647A9B]">
        Parent batch status: <Badge variant={display.variant}>{display.label}</Badge>
      </p>
    </div>
  );
}

export function BatchTimingManageHeader({
  batch,
  timing,
  parentLabel,
}: Props) {
  return (
    <div className="space-y-3">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/dashboard" className="text-[#647A9B] hover:text-[#2563EB]">
          {parentLabel}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link href="/batches" className="text-[#647A9B] hover:text-[#2563EB]">
          My Batches
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link
          href={batchManagePath(batch.id)}
          className="text-[#647A9B] hover:text-[#2563EB]"
        >
          {batch.name}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-[#102A56]">{timing.name}</span>
      </nav>

      <div className="rounded-2xl border border-[#E1EBF5] bg-white p-4">
        <h1 className="text-xl font-bold tracking-tight text-[#102A56]">
          {timing.name}
        </h1>
        <p className="mt-1 text-sm text-[#647A9B]">
          {batch.name} · {formatBatchMode(timing.mode)} ·{" "}
          {formatBatchTiming(timing.startTime, timing.endTime)}
        </p>
      </div>
    </div>
  );
}
