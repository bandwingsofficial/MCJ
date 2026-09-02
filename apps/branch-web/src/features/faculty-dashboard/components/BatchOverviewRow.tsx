"use client";

import Link from "next/link";

import {
  formatBatchLabel,
  formatBatchDate,
  formatBatchTime,
} from "@/src/features/branch-ops/utils/batch-display";

import type { FacultyBatchOverviewItem } from "../types/facultyDashboard.types";
import { DASHBOARD_ROUTES } from "../constants";
import {
  DASHBOARD_TABLE_CELL,
  DASHBOARD_TABLE_ROW,
  TruncatedCell,
} from "./DashboardTable";

interface Props {
  batch: FacultyBatchOverviewItem;
  nextSession?: { date: string; startTime: string } | null;
}

export function BatchOverviewRow({ batch, nextSession }: Props) {
  const batchLabel = formatBatchLabel(batch.name, batch.code);
  const nextSessionLabel = nextSession
    ? `${formatBatchDate(nextSession.date).replace(/ \d{4}$/, "")}, ${formatBatchTime(nextSession.startTime)}`
    : batch.upcomingSession
      ? formatBatchDate(batch.upcomingSession)
      : "—";

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
      <td className={`${DASHBOARD_TABLE_CELL} text-sm tabular-nums text-[#102A56]`}>
        {batch.activeStudents}
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm font-medium tabular-nums text-[#102A56]`}>
        {batch.attendancePercentage != null
          ? `${batch.attendancePercentage}%`
          : "—"}
      </td>
      <td className={`${DASHBOARD_TABLE_CELL} text-sm text-[#647A9B]`}>
        <TruncatedCell title={nextSessionLabel}>{nextSessionLabel}</TruncatedCell>
      </td>
    </tr>
  );
}
