"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Monitor,
  PlayCircle,
  Video,
} from "lucide-react";

import type { BatchMode } from "@/src/features/batches/types/batch.types";
import type { CourseUpcomingTableRow } from "@/src/features/courses/utils/course-batch.utils";
import { getCourseEnrollPath } from "@/src/features/courses/utils/course-route.utils";
import { cn } from "@/src/shared/lib/cn";

const MODE_BADGE_STYLES: Record<BatchMode, string> = {
  OFFLINE: "border-orange-100 bg-orange-50 text-orange-700",
  ONLINE: "border-blue-100 bg-blue-50 text-blue-700",
  RECORDED: "border-purple-100 bg-purple-50 text-purple-700",
};

function ModeBadge({ mode, label }: { mode: BatchMode; label: string }) {
  const Icon =
    mode === "OFFLINE" ? Monitor : mode === "ONLINE" ? Video : PlayCircle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
        MODE_BADGE_STYLES[mode],
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      {label}
    </span>
  );
}

function JoinNowButton({
  row,
  courseSlug,
  courseId,
}: {
  row: CourseUpcomingTableRow;
  courseSlug: string | null;
  courseId: string;
}) {
  const resolvedCourseId = row.courseId || courseId;
  const resolvedCourseSlug = row.courseSlug ?? courseSlug;

  if (!row.joinEnabled || !resolvedCourseSlug || !resolvedCourseId) {
    return <span className="text-xs font-medium text-slate-400">Unavailable</span>;
  }

  const href =
    row.timingId
      ? getCourseEnrollPath(
          { slug: resolvedCourseSlug },
          {
            batchId: row.batchId,
            branchId: row.branchId ?? undefined,
            courseId: resolvedCourseId,
            batchTimingId: row.timingId,
            mode: row.mode,
          },
        )
      : null;

  if (!href) {
    return <span className="text-xs font-medium text-slate-400">Unavailable</span>;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 py-2 text-xs font-semibold text-white transition hover:from-[#2860D4] hover:to-[#1A3F96]"
    >
      Join Now
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

interface BatchTimingsTableProps {
  rows: CourseUpcomingTableRow[];
  courseSlug: string | null;
  courseId: string;
  /** When false, hide Join/Enroll action column (informational tables). */
  showActions?: boolean;
}

export function BatchTimingsTable({
  rows,
  courseSlug,
  courseId,
  showActions = true,
}: BatchTimingsTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse text-left text-sm",
            showActions ? "min-w-[920px]" : "min-w-[780px]",
          )}
        >
          <thead>
            <tr className="border-b border-slate-200 bg-[#F4F8FC] text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
              <th className="px-4 py-3.5">Batch Name</th>
              <th className="px-4 py-3.5">Mode</th>
              <th className="px-4 py-3.5">Batch / Timing</th>
              <th className="px-4 py-3.5">Days</th>
              <th className="px-4 py-3.5">Start Date</th>
              <th className="px-4 py-3.5">Fee</th>
              {showActions ? <th className="px-4 py-3.5">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={cn(
                  "border-b border-slate-100 align-middle last:border-0",
                  row.isFirstRowInBatch &&
                    rowIndex > 0 &&
                    "border-t-2 border-slate-200",
                  row.isFirstRowInModeGroup &&
                    !row.isFirstRowInBatch &&
                    "border-t-2 border-slate-200/80",
                )}
              >
                {row.isFirstRowInBatch ? (
                  <td
                    rowSpan={row.batchRowSpan}
                    className="border-r border-slate-100 px-4 py-4 align-middle"
                  >
                    <p className="font-semibold text-[#0B1F3A]">{row.batchName}</p>
                  </td>
                ) : null}

                <td className="px-4 py-3.5">
                  <ModeBadge mode={row.mode} label={row.modeBadgeLabel} />
                </td>

                <td className="px-4 py-3.5">
                  <p className="font-semibold text-[#0B1F3A]">{row.timingName}</p>
                  {row.showTimingRange ? (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {row.startTimeLabel} – {row.endTimeLabel}
                    </p>
                  ) : null}
                </td>

                <td className="px-4 py-3.5 text-slate-600">{row.days}</td>

                <td className="px-4 py-3.5">
                  <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
                    {row.startDateLabel}
                  </span>
                </td>

                <td className="px-4 py-3.5">
                  <span className="font-bold text-[#0B1F3A]">{row.feeLabel}</span>
                </td>

                {showActions ? (
                  <td className="px-4 py-3.5">
                    <JoinNowButton
                      row={row}
                      courseSlug={courseSlug}
                      courseId={courseId}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
