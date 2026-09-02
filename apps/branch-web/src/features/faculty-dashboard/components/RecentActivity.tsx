"use client";

import type { FacultyActivityItem } from "../types/facultyDashboard.types";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_ROUTES } from "../constants";
import { RecentActivityItem } from "./RecentActivityItem";
import {
  DashboardEmptyState,
  DashboardSection,
} from "./DashboardSection";

interface Props {
  items: FacultyActivityItem[];
}

export function RecentActivity({ items }: Props) {
  const rows = items.slice(0, DASHBOARD_LIST_LIMIT);

  return (
    <DashboardSection
      title="Recent Activity"
      viewAllHref={DASHBOARD_ROUTES.attendance}
      className="h-full"
    >
      {!rows.length ? (
        <DashboardEmptyState message="No recent activity." />
      ) : (
        <ul>{rows.map((item) => (
          <RecentActivityItem key={`${item.type}-${item.id}`} item={item} />
        ))}</ul>
      )}
    </DashboardSection>
  );
}
