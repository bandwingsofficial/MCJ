"use client";

import { Eye } from "lucide-react";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatBatchDateRange } from "@/src/features/batches/utils/batch.helper";
import { getBatchDisplayStatus } from "@/src/features/batches/utils/batch-select.utils";
import {
  formatBatchModesLabel,
} from "@/src/features/batches/utils/batch-mode.utils";
import {
  getBatchModeSummaries,
  getBatchTimingsCount,
} from "@/src/features/batches/utils/batch-timing.utils";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";

interface Props {
  batch: Batch;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-[#102A56]">{value}</p>
    </div>
  );
}

export function BranchBatchOverviewCard({ batch }: Props) {
  const displayStatus = getBatchDisplayStatus(batch);
  const timingsCount = getBatchTimingsCount(batch);
  const modeSummaries = getBatchModeSummaries(batch);
  const scheduleRange = formatBatchDateRange(
    batch.startDate,
    batch.endDate,
  ).replace(" – ", " → ");
  const totalStudents = modeSummaries.reduce(
    (total, row) => total + row.studentsCount,
    0,
  );

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#102A56]">
            {batch.name}
          </h3>
          <p className="mt-0.5 font-mono text-sm text-[#647A9B]">
            {batch.code}
          </p>
        </div>
        <BranchIconAction
          icon={Eye}
          label="View batch"
          href={`/batches/${batch.id}/manage`}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <BatchStatusBadge
          displayStatus={displayStatus}
          status={batch.status}
          isActive={batch.isActive}
          isDeleted={Boolean(batch.isDeleted || batch.deletedAt)}
        />
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DetailRow
          label="Course"
          value={batch.course?.title?.trim() || "No course assigned"}
        />
        <DetailRow label="Learning Modes" value={formatBatchModesLabel(batch)} />
        <DetailRow label="Schedule" value={scheduleRange} />
        <DetailRow
          label="Batch Timings"
          value={`${timingsCount} Batch Timing${timingsCount === 1 ? "" : "s"}`}
        />
        <DetailRow
          label="Students"
          value={`${totalStudents} student${totalStudents === 1 ? "" : "s"}`}
        />
      </dl>

      {modeSummaries.length > 0 ? (
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Mode Breakdown
          </p>
          {modeSummaries.map((row) => (
            <div
              key={row.mode}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="font-medium text-[#102A56]">{row.label}</span>
              <span className="text-[#647A9B]">
                {row.timingsCount} timing{row.timingsCount === 1 ? "" : "s"} ·{" "}
                {row.studentsCount} student
                {row.studentsCount === 1 ? "" : "s"}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
