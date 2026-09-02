"use client";

import type {
  FacultyAttendanceSummary,
  FacultyAttendanceTrendPoint,
} from "../types/facultyDashboard.types";
import { DASHBOARD_COLORS, DASHBOARD_ROUTES } from "../constants";
import { AttendanceChart } from "./AttendanceChart";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

function StatBlock({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-[#E8EEF5] bg-[#F8FBFF] px-2 py-2 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p
        className="mt-0.5 text-base font-bold tabular-nums text-[#102A56]"
        style={color ? { color } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

interface Props {
  trend: FacultyAttendanceTrendPoint[];
  summary?: FacultyAttendanceSummary | null;
}

export function AttendanceOverview({ trend, summary }: Props) {
  const hasData = trend.length > 0 || (summary?.total ?? 0) > 0;

  return (
    <DashboardSection
      title="Attendance Overview"
      viewAllHref={DASHBOARD_ROUTES.attendance}
      className="h-full"
    >
      {!hasData ? (
        <DashboardEmptyState message="No attendance records for this period." />
      ) : (
        <>
          <AttendanceChart data={trend} />
          {summary ? (
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              <StatBlock
                label="Present"
                value={summary.present}
                color={DASHBOARD_COLORS.present}
              />
              <StatBlock
                label="Absent"
                value={summary.absent}
                color={DASHBOARD_COLORS.absent}
              />
              <StatBlock
                label="Late"
                value={summary.late}
                color={DASHBOARD_COLORS.late}
              />
              <StatBlock label="Attendance" value={`${summary.percentage}%`} />
            </div>
          ) : null}
        </>
      )}
    </DashboardSection>
  );
}
