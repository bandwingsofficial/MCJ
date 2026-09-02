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
          label="Working Days"
          value={summary.workingDays ?? "—"}
        />
        <SummaryRow label="Attendance Dates" value={summary.attendanceDates} />
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
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Present
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Absent
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Late
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-300" />
            No Record
          </li>
        </ul>
      </div>
    </div>
  );
}
