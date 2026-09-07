"use client";

import Link from "next/link";

import type { BatchListItem } from "@/src/features/branch-ops/types";
import {
  courseTitle,
  formatBatchDate,
  formatBatchStatus,
  formatLearningModes,
  getBatchDisplayStatus,
  isBatchLifecycleGreyed,
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
          "mt-0.5 text-sm font-medium",
          muted ? "text-slate-500" : "text-[#102A56]",
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function FacultyBatchCard({ batch }: Props) {
  const display = getBatchDisplayStatus(batch);
  const greyed = isBatchLifecycleGreyed(batch);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border p-4 shadow-[0_2px_10px_rgba(16,42,86,0.04)]",
        greyed
          ? "cursor-default border-slate-200 bg-slate-100/90"
          : "border-[#E1EBF5] bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              "truncate text-base font-semibold",
              greyed ? "text-slate-500" : "text-[#102A56]",
            )}
          >
            {batch.name}
          </h3>
        </div>
        <Badge variant={display.variant} className="shrink-0">
          {display.label}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3">
        <Detail
          label="Learning mode"
          value={formatLearningModes(batch.learningModes, batch.mode)}
          muted={greyed}
        />
        <Detail label="Course" value={courseTitle(batch.course)} muted={greyed} />
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
          label="Batch status"
          value={formatBatchStatus(batch.status)}
          muted={greyed}
        />
      </div>

      <div className="mt-4 flex justify-end">
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
