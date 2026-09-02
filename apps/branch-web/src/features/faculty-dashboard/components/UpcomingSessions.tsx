"use client";

import type { FacultyUpcomingSession } from "../types/facultyDashboard.types";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_ROUTES } from "../constants";
import { UpcomingSessionRow } from "./UpcomingSessionRow";
import {
  DASHBOARD_TABLE,
  DASHBOARD_TABLE_HEAD,
} from "./DashboardTable";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

interface Props {
  sessions: FacultyUpcomingSession[];
}

export function UpcomingSessions({ sessions }: Props) {
  const rows = sessions.slice(0, DASHBOARD_LIST_LIMIT);

  return (
    <DashboardSection
      title="Upcoming Sessions"
      viewAllHref={DASHBOARD_ROUTES.batches}
      className="h-full"
    >
      {!rows.length ? (
        <DashboardEmptyState message="No upcoming sessions." />
      ) : (
        <table className={DASHBOARD_TABLE}>
          <colgroup>
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[34%]" />
            <col className="w-[30%]" />
          </colgroup>
          <thead>
            <tr className={DASHBOARD_TABLE_HEAD}>
              <th className="pb-2 pr-2 font-semibold">Date</th>
              <th className="pb-2 pr-2 font-semibold">Time</th>
              <th className="pb-2 pr-2 font-semibold">Session</th>
              <th className="pb-2 font-semibold">Batch</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((session) => (
              <UpcomingSessionRow
                key={`${session.batchCourseId}-${session.date}-${session.startTime}`}
                session={session}
              />
            ))}
          </tbody>
        </table>
      )}
    </DashboardSection>
  );
}
