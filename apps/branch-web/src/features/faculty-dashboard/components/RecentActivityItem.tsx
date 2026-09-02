"use client";

import {
  Activity,
  ClipboardList,
  UserCheck,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { formatDashboardTimestamp } from "../utils/dashboard-date.utils";
import type { FacultyActivityItem } from "../types/facultyDashboard.types";
import { DASHBOARD_COLORS } from "../constants";

function activityIcon(type: string, title: string): LucideIcon {
  const normalized = `${type} ${title}`.toUpperCase();
  if (normalized.includes("ATTENDANCE")) return UserCheck;
  if (normalized.includes("ASSESSMENT")) return ClipboardList;
  if (normalized.includes("ENROLL")) return UserPlus;
  return Activity;
}

function activityColor(type: string, title: string): string {
  const normalized = `${type} ${title}`.toUpperCase();
  if (normalized.includes("ATTENDANCE")) return DASHBOARD_COLORS.present;
  if (normalized.includes("ASSESSMENT")) return DASHBOARD_COLORS.primary;
  if (normalized.includes("ENROLL")) return "#7C3AED";
  return DASHBOARD_COLORS.muted;
}

interface Props {
  item: FacultyActivityItem;
}

export function RecentActivityItem({ item }: Props) {
  const Icon = activityIcon(item.type, item.title);
  const color = activityColor(item.type, item.title);

  return (
    <li className="flex gap-2.5 border-b border-[#E8EEF5] py-2 last:border-0">
      <div
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${color}14`, color }}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[#102A56]">{item.title}</p>
        {item.subtitle ? (
          <p className="mt-0.5 truncate text-xs text-[#647A9B]">
            {item.subtitle}
          </p>
        ) : null}
      <p className="mt-0.5 text-[11px] text-[#94A3B8]">
        {formatDashboardTimestamp(item.occurredAt)}
      </p>
      </div>
    </li>
  );
}
