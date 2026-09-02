"use client";

import type {
  FacultyBatchOverviewItem,
  FacultyUpcomingSession,
} from "../types/facultyDashboard.types";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_ROUTES } from "../constants";
import { BatchOverviewRow } from "./BatchOverviewRow";
import {
  DASHBOARD_TABLE,
  DASHBOARD_TABLE_HEAD,
} from "./DashboardTable";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

function buildNextSessionMap(sessions: FacultyUpcomingSession[]) {
  const map = new Map<string, { date: string; startTime: string }>();
  for (const session of sessions) {
    const existing = map.get(session.batchId);
    if (
      !existing ||
      session.date < existing.date ||
      (session.date === existing.date &&
        session.startTime < existing.startTime)
    ) {
      map.set(session.batchId, {
        date: session.date,
        startTime: session.startTime,
      });
    }
  }
  return map;
}

interface Props {
  batches: FacultyBatchOverviewItem[];
  upcomingSessions?: FacultyUpcomingSession[];
}

export function BatchOverview({ batches, upcomingSessions = [] }: Props) {
  const nextSessionByBatch = buildNextSessionMap(upcomingSessions);
  const rows = batches.slice(0, DASHBOARD_LIST_LIMIT);

  return (
    <DashboardSection
      title="Batch Overview"
      viewAllHref={DASHBOARD_ROUTES.batches}
      className="h-full"
    >
      {!rows.length ? (
        <DashboardEmptyState message="No batches assigned." />
      ) : (
        <table className={DASHBOARD_TABLE}>
          <colgroup>
            <col className="w-[38%]" />
            <col className="w-[14%]" />
            <col className="w-[16%]" />
            <col className="w-[32%]" />
          </colgroup>
          <thead>
            <tr className={DASHBOARD_TABLE_HEAD}>
              <th className="pb-2 pr-2 font-semibold">Batch</th>
              <th className="pb-2 pr-2 font-semibold">Students</th>
              <th className="pb-2 pr-2 font-semibold">Attendance</th>
              <th className="pb-2 font-semibold">Next Session</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((batch) => (
              <BatchOverviewRow
                key={batch.id}
                batch={batch}
                nextSession={nextSessionByBatch.get(batch.id)}
              />
            ))}
          </tbody>
        </table>
      )}
    </DashboardSection>
  );
}
