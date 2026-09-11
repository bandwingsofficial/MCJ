"use client";

import type { EnrollmentAttendanceDetail } from "@/src/features/enrollments/types/enrollment-attendance.types";

interface Props {
  summary: EnrollmentAttendanceDetail["summary"];
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-[#E8F0FA] bg-white/80 px-3 py-2 text-sm">
      <span className="text-[#647A9B]">{label}</span>
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
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-gradient-to-br from-[#F8FBFF] to-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#102A56]">
          Attendance Summary
        </h3>
        <p className="mt-0.5 text-xs text-[#647A9B]">
          Calendar and session statistics.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <section>
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Batch Calendar Summary
          </h4>
          <div className="mt-2 space-y-2">
            <SummaryRow label="Total Working Days" value={calendar.workingDays} />
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

        <section className="border-t border-[#E8F0FA] pt-4">
          <h4 className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Attendance / Session Summary
          </h4>
          <div className="mt-2 space-y-2">
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
              <p className="text-xs text-[#647A9B]">
                Ratio: {attendance.ratioLabel}
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
