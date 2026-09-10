"use client";

import Link from "next/link";
import { Settings2 } from "lucide-react";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import { BatchModeBadge } from "@/src/features/branch-ops/components/batches/batch-mode-badge";
import { BatchStatusBadge } from "@/src/features/branch-ops/components/batches/batch-status-badge";
import {
  assignedLabel,
  courseTitle,
  formatBatchDate,
  formatBatchTiming,
  formatWorkingDays,
  isBatchLifecycleGreyed,
  trainerNames,
} from "@/src/features/branch-ops/utils/batch-display";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  batch: BatchListItem;
}

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

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
      <p className="text-[11px] font-semibold tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p
        className={cn(
          "mt-0.5 truncate text-sm leading-snug",
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
  const greyed = isBatchLifecycleGreyed(batch);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-xl border p-3.5 shadow-sm",
        greyed
          ? "cursor-default border-slate-200 bg-slate-50/80"
          : "border-[#E1EBF5] bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "truncate text-sm font-semibold leading-snug",
              greyed ? "text-slate-500" : "text-[#102A56]",
            )}
          >
            {batch.name}
          </h3>
          <p className="mt-0.5 font-mono text-xs text-[#647A9B]">{batch.code}</p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
          <BatchStatusBadge status={batch.status} />
          <BatchModeBadge mode={batch.mode} />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5">
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

      <div className="mt-3 flex justify-end border-t border-slate-100 pt-2.5">
        <Tooltip content="Manage batch">
          <Link
            href={`/batches/${batch.id}`}
            className={`${iconButtonClass} text-blue-900`}
            aria-label="Manage batch"
          >
            <Settings2 className={iconClass} />
          </Link>
        </Tooltip>
      </div>
    </article>
  );
}
