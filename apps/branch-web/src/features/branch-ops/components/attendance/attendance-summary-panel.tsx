"use client";

import type { StudentBatchAttendanceDetail } from "@/src/features/branch-ops/types";

interface Props {
  summary: StudentBatchAttendanceDetail["summary"];
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-[#102A56]">{value}</span>
    </div>
  );
}

export function AttendanceSummaryPanel({ summary }: Props) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Attendance Summary
      </h3>

      <div className="mt-3 space-y-2">
        <SummaryRow
          label="Working Days / Sessions"
          value={summary.sessionsConducted}
        />
        <SummaryRow label="Present" value={summary.present} />
        <SummaryRow label="Absent" value={summary.absent} />
        <SummaryRow label="Late" value={summary.late} />
        <SummaryRow
          label="Attendance %"
          value={
            summary.percentage != null ? `${summary.percentage}%` : "—"
          }
        />
        {summary.ratioLabel ? (
          <p className="text-xs text-slate-500">Ratio: {summary.ratioLabel}</p>
        ) : null}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Legend
        </p>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-emerald-100 ring-1 ring-emerald-200" />
            Present
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-red-100 ring-1 ring-red-200" />
            Absent
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-amber-100 ring-1 ring-amber-200" />
            Late
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-white ring-1 ring-slate-200" />
            No Session / Future
          </li>
        </ul>
      </div>
    </div>
  );
}
