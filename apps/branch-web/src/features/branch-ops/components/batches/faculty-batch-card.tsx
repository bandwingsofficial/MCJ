"use client";

import Link from "next/link";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchMode,
  formatBatchTiming,
  formatWorkingDays,
  getBatchDisplayStatus,
  isBatchLifecycleGreyed,
  trainerNames,
} from "@/src/features/branch-ops/utils/batch-display";
import { Badge } from "@/src/shared/components/ui/badge";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  batch: BatchListItem;
}

function Detail({
  label,
  value,
  muted,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm font-medium",
          muted ? "text-slate-500" : "text-[#102A56]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FacultyBatchCard({ batch }: Props) {
  const trainer = trainerNames(batch.trainers);
  const available =
    batch.availableSeats == null ? "—" : String(batch.availableSeats);
  const display = getBatchDisplayStatus(batch);
  const greyed = isBatchLifecycleGreyed(batch);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border p-5 shadow-[0_2px_10px_rgba(16,42,86,0.04)]",
        greyed
          ? "cursor-default border-slate-200 bg-slate-100/90"
          : "border-[#E1EBF5] bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={cn(
              "truncate text-base font-semibold",
              greyed ? "text-slate-500" : "text-[#102A56]",
            )}
          >
            {batch.name}
          </h3>
          <p className="mt-0.5 font-mono text-sm text-[#647A9B]">{batch.code}</p>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
          <Badge variant={display.variant}>{display.label}</Badge>
          <Badge variant="info">{formatBatchMode(batch.mode)}</Badge>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Detail label="Course" value={courseTitle(batch.course)} muted={greyed} />
        <Detail label="Trainer" value={assignedLabel(trainer)} muted={greyed} />
        <Detail
          label="Start date"
          value={formatBatchDate(batch.startDate)}
          muted={greyed}
        />
        <Detail
          label="End date"
          value={formatBatchDate(batch.endDate)}
          muted={greyed}
        />
        <Detail
          label="Working days"
          value={formatWorkingDays(batch.daysOfWeek)}
          muted={greyed}
        />
        <Detail
          label="Timing"
          value={formatBatchTiming(batch.startTime, batch.endTime)}
          muted={greyed}
        />
        <Detail
          label="Students"
          value={String(batch.enrolledStudents)}
          muted={greyed}
        />
        <Detail label="Available seats" value={available} muted={greyed} />
      </div>

      <div className="mt-5 flex justify-end">
        <Link
          href={`/batches/${batch.id}`}
          className={cn(
            "inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-white",
            greyed
              ? "bg-slate-500 hover:bg-slate-600"
              : "bg-[#2447A8] hover:bg-[#1E3A8A]",
          )}
        >
          Manage
        </Link>
      </div>
    </article>
  );
}
