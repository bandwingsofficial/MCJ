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

function formatPercentage(value: number | null): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function AttendanceSummaryPanel({ summary }: Props) {
  const { calendar, attendance } = summary;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <section>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Batch Calendar Summary
        </h3>
        <div className="mt-3 space-y-2">
          <SummaryRow
            label="Total Working Days"
            value={calendar.workingDays}
          />
          <SummaryRow label="Total Sundays" value={calendar.sundays} />
          <SummaryRow label="Total Holidays" value={calendar.holidays} />
          <SummaryRow
            label="Total Non-Working Days"
            value={calendar.nonWorkingDays}
          />
          <SummaryRow
            label="Total Calendar Days"
            value={calendar.totalCalendarDays}
          />
        </div>
      </section>

      <section className="mt-5 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Attendance / Session Summary
        </h3>
        <div className="mt-3 space-y-2">
          <SummaryRow
            label="Total Sessions"
            value={attendance.totalSessions}
          />
          <SummaryRow label="Total Attended" value={attendance.attended} />
          <SummaryRow label="Present" value={attendance.present} />
          <SummaryRow label="Absent" value={attendance.absent} />
          <SummaryRow label="Late" value={attendance.late} />
          <SummaryRow
            label="Attendance %"
            value={formatPercentage(attendance.percentage)}
          />
          {attendance.ratioLabel ? (
            <p className="text-xs text-slate-500">
              Ratio: {attendance.ratioLabel}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mt-4 border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Legend
        </p>
        <ul className="space-y-1.5 text-xs text-slate-600">
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-emerald-100 ring-1 ring-emerald-200" />
            Present / Working Day
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-red-100 ring-1 ring-red-200" />
            Absent
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-amber-100 ring-1 ring-amber-200" />
            Late / Holiday
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-violet-50 ring-1 ring-violet-200" />
            Sunday
          </li>
          <li className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-md bg-slate-100 ring-1 ring-slate-200" />
            Non-Working / Future / Outside Period
          </li>
        </ul>
      </div>
    </div>
  );
}
