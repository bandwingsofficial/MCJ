"use client";

import { formatAttendanceDisplayDate } from "@/src/features/branch-ops/utils/attendance-date.utils";
import { formatBatchLabel } from "@/src/features/branch-ops/utils/batch-display";

import type { FacultyUpcomingSession } from "../types/facultyDashboard.types";
import { formatSessionTime } from "../utils/dashboard-date.utils";
import {
  DASHBOARD_TABLE_CELL,
  DASHBOARD_TABLE_ROW,
  TruncatedCell,
} from "./DashboardTable";

interface Props {
  session: FacultyUpcomingSession;
}

export function UpcomingSessionRow({ session }: Props) {
  const formattedDate = formatAttendanceDisplayDate(session.date);
  const [day, month] = formattedDate.split(" ");
  const batchLabel = formatBatchLabel(session.batchName, session.batchCode);
  const timeLabel = formatSessionTime(session.startTime);

  return (
    <tr className={DASHBOARD_TABLE_ROW}>
      <td className={DASHBOARD_TABLE_CELL}>
        <span className="text-sm font-semibold text-[#102A56]">{day}</span>
        <span className="ml-1 text-xs text-[#647A9B]">{month}</span>
      </td>
      <td
        className={`${DASHBOARD_TABLE_CELL} text-sm text-[#647A9B]`}
        title={timeLabel}
      >
        {timeLabel}
      </td>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell
          className="text-sm text-[#102A56]"
          title={session.sessionLabel}
        >
          {session.sessionLabel}
        </TruncatedCell>
      </td>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell
          className="text-sm text-[#647A9B]"
          title={batchLabel}
        >
          {batchLabel}
        </TruncatedCell>
      </td>
    </tr>
  );
}
