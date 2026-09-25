"use client";

import Link from "next/link";

import {
  formatBatchLabel,
  formatBatchDate,
  formatBatchTime,
} from "@/src/features/branch-ops/utils/batch-display";

import type {
  FacultyBatchOverviewItem,
  FacultyUpcomingSession,
} from "../types/facultyDashboard.types";
import { DASHBOARD_ROUTES } from "../constants";
import { formatSessionTime } from "../utils/dashboard-date.utils";
import {
  DASHBOARD_TABLE_CELL,
  DASHBOARD_TABLE_ROW,
  TruncatedCell,
} from "./DashboardTable";

interface Props {
  batch: FacultyBatchOverviewItem;
  nextSession?: FacultyUpcomingSession | null;
}

function formatNextClassLabel(
  nextSession: FacultyUpcomingSession | null | undefined,
  fallbackDate: string | null,
) {
  if (nextSession) {
    const datePart = formatBatchDate(nextSession.date).replace(/ \d{4}$/, "");
    return `${datePart}, ${formatSessionTime(nextSession.startTime)}`;
  }
  if (fallbackDate) {
    return formatBatchDate(fallbackDate);
  }
  return "—";
}

function formatTimingLabel(nextSession: FacultyUpcomingSession | null | undefined) {
  if (!nextSession) return "—";
  const start = formatSessionTime(nextSession.startTime);
  const end = formatSessionTime(nextSession.endTime);
  return `${start} – ${end}`;
}

export function BatchOverviewRow({ batch, nextSession }: Props) {
  const batchLabel = formatBatchLabel(batch.name, batch.code);
  const nextClassLabel = formatNextClassLabel(nextSession, batch.upcomingSession);
  const sessionLabel = nextSession?.sessionLabel ?? batch.courseTitle ?? "—";
  const timingLabel = formatTimingLabel(nextSession);

  return (
    <tr className={DASHBOARD_TABLE_ROW}>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell title={batchLabel}>
          <Link
            href={DASHBOARD_ROUTES.batch(batch.id)}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            {batchLabel}
          </Link>
        </TruncatedCell>
        {batch.courseTitle ? (
          <TruncatedCell
            className="mt-0.5 text-xs text-[#647A9B]"
            title={batch.courseTitle}
          >
            {batch.courseTitle}
          </TruncatedCell>
        ) : null}
      </td>
      <td className={DASHBOARD_TABLE_CELL}>
        <TruncatedCell
          className="text-sm text-[#102A56]"
          title={sessionLabel}
        >
          {sessionLabel}
        </TruncatedCell>
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm text-[#647A9B]`}>
        <TruncatedCell title={timingLabel}>{timingLabel}</TruncatedCell>
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm tabular-nums text-[#102A56]`}>
        {batch.activeStudents}
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm text-[#647A9B]`}>
        <TruncatedCell title={nextClassLabel}>{nextClassLabel}</TruncatedCell>
        {batch.pendingAttendance > 0 ? (
          <p className="mt-0.5 text-[11px] font-medium text-[#EA580C]">
            {batch.pendingAttendance} pending attendance
          </p>
        ) : null}
      </td>
    </tr>
  );
}
