"use client";

import Link from "next/link";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchMode,
  formatBatchStatus,
  formatBatchTiming,
  formatWorkingDays,
  statusBadgeVariant,
  trainerNames,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  batch: BatchListItem;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function FacultyBatchCard({ batch }: Props) {
  const trainer = trainerNames(batch.trainers);
  const available =
    batch.availableSeats == null
      ? "—"
      : String(batch.availableSeats);

  return (
    <article className="flex h-full flex-col rounded-2xl border border-[#E1EBF5] bg-white p-5 shadow-[0_2px_10px_rgba(16,42,86,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#102A56]">
            {batch.name}
          </h3>
          <p className="mt-0.5 font-mono text-sm text-[#647A9B]">{batch.code}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <Badge variant={statusBadgeVariant(batch.status)}>
            {formatBatchStatus(batch.status)}
          </Badge>
          <Badge variant="info">{formatBatchMode(batch.mode)}</Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Detail label="Course" value={courseTitle(batch.course)} />
        <Detail label="Trainer" value={assignedLabel(trainer)} />
        <Detail label="Start date" value={formatBatchDate(batch.startDate)} />
        <Detail label="End date" value={formatBatchDate(batch.endDate)} />
        <Detail
          label="Working days"
          value={formatWorkingDays(batch.daysOfWeek)}
        />
        <Detail
          label="Timing"
          value={formatBatchTiming(batch.startTime, batch.endTime)}
        />
        <Detail label="Students" value={String(batch.enrolledStudents)} />
        <Detail label="Available seats" value={available} />
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/batches/${batch.id}`}
          className="inline-flex h-9 items-center rounded-xl bg-[#2447A8] px-4 text-sm font-medium text-white hover:bg-[#1E3A8A]"
        >
          Manage
        </Link>
      </div>
    </article>
  );
}
