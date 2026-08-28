"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  formatWorkingDays,
  statusBadgeVariant,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  batch: BatchListItem;
  parentLabel: string;
}

function HeaderField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function BatchManageHeader({ batch, parentLabel }: Props) {
  const trainer =
    batch.trainers?.map((item) => item.name).filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-4">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm">
        <Link href="/dashboard" className="text-[#647A9B] hover:text-[#2563EB]">
          {parentLabel}
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <Link href="/batches" className="text-[#647A9B] hover:text-[#2563EB]">
          Batches
        </Link>
        <ChevronRight className="h-4 w-4 text-slate-400" />
        <span className="font-medium text-[#102A56]">{batch.name}</span>
      </nav>

      <section className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#102A56]">
              {batch.name}
            </h1>
            <p className="mt-0.5 font-mono text-sm text-[#647A9B]">{batch.code}</p>
          </div>
          <div className="flex gap-1.5">
            <Badge variant={statusBadgeVariant(batch.status)}>
              {formatBatchStatus(batch.status)}
            </Badge>
            <Badge variant="info">{formatBatchMode(batch.mode)}</Badge>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <HeaderField label="Course" value={batch.course?.title ?? "—"} />
          <HeaderField label="Trainer" value={trainer} />
          <HeaderField label="Start date" value={formatBatchDate(batch.startDate)} />
          <HeaderField label="End date" value={formatBatchDate(batch.endDate)} />
          <HeaderField
            label="Timing"
            value={formatBatchTiming(batch.startTime, batch.endTime)}
          />
          <HeaderField
            label="Working days"
            value={formatWorkingDays(batch.daysOfWeek)}
          />
          <HeaderField
            label="Students"
            value={String(batch.enrolledStudents)}
          />
          <HeaderField
            label="Available seats"
            value={
              batch.availableSeats == null ? "—" : String(batch.availableSeats)
            }
          />
        </div>
      </section>
    </div>
  );
}
