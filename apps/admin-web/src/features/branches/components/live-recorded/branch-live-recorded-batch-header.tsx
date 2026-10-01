"use client";

import { Radio } from "lucide-react";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { getBatchDisplayStatus } from "@/src/features/batches/utils/batch-select.utils";
import { getBatchTimingsCount } from "@/src/features/batches/utils/batch-timing.utils";

interface Props {
  courseTitle: string;
  courseCode?: string | null;
  batch: Batch;
  moduleCount: number;
  lessonCount: number;
  liveVideoCount: number;
}

function InlineStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="text-base font-semibold tabular-nums text-[#102A56]">{value}</p>
    </div>
  );
}

export function BranchLiveRecordedBatchHeader({
  courseTitle,
  courseCode,
  batch,
  moduleCount,
  lessonCount,
  liveVideoCount,
}: Props) {
  const displayStatus = getBatchDisplayStatus(batch);
  const timingsCount = getBatchTimingsCount(batch);
  const timingsLabel = `${timingsCount} Batch Timing${timingsCount === 1 ? "" : "s"}`;

  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-5">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2563EB] text-white shadow-sm">
            <Radio className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
              Live Recorded Videos
            </p>
            <h1 className="truncate text-base font-semibold text-[#102A56] sm:text-lg">
              {courseTitle}
            </h1>
            {courseCode?.trim() ? (
              <p className="font-mono text-xs text-[#647A9B]">{courseCode.trim()}</p>
            ) : null}
          </div>
        </div>

        <div className="min-w-0 shrink-0 border-[#E8F0FA] lg:border-l lg:pl-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Batch
          </p>
          <p className="truncate text-sm font-medium text-[#102A56]">{batch.name}</p>
          <p className="text-xs text-[#647A9B]">{timingsLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-5 lg:shrink-0 lg:border-l lg:border-[#E8F0FA] lg:pl-4">
          <InlineStat label="Modules" value={moduleCount} />
          <InlineStat label="Lessons" value={lessonCount} />
          <InlineStat label="Live Videos" value={liveVideoCount} />
        </div>

        <div className="shrink-0 lg:pl-1">
          <BatchStatusBadge
            displayStatus={displayStatus}
            status={batch.status}
            isActive={batch.isActive}
            isDeleted={Boolean(batch.isDeleted || batch.deletedAt)}
          />
        </div>
      </div>
    </div>
  );
}
