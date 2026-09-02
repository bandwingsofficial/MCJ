import { toLocalDateInput } from "@/src/features/branch-ops/utils/attendance-date.utils";

import type { DashboardDatePreset } from "../types/facultyDashboard.types";

export function resolveDashboardDateRange(
  preset: DashboardDatePreset,
  customFrom?: string,
  customTo?: string,
): { from?: string; to?: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (preset === "TODAY") {
    const value = toLocalDateInput(today);
    return { from: value, to: value };
  }

  if (preset === "YESTERDAY") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const value = toLocalDateInput(yesterday);
    return { from: value, to: value };
  }

  if (preset === "THIS_WEEK") {
    const weekday = today.getDay();
    const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
    const from = new Date(today);
    from.setDate(from.getDate() + mondayOffset);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  if (preset === "THIS_MONTH") {
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  if (preset === "LAST_7_DAYS") {
    const from = new Date(today);
    from.setDate(from.getDate() - 6);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  if (preset === "LAST_30_DAYS") {
    const from = new Date(today);
    from.setDate(from.getDate() - 29);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  return {
    from: customFrom || undefined,
    to: customTo || undefined,
  };
}

export function formatDashboardTimestamp(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDashboardTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  const timePart = date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return `Today, ${timePart}`;
  }
  if (diffDays === 1 || (diffHours < 48 && diffDays < 2)) {
    return `Yesterday, ${timePart}`;
  }
  if (diffDays < 7) return `${diffDays}d ago`;

  return formatDashboardTimestamp(value);
}

export function formatSessionTime(value: string) {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw ?? 0);
  if (Number.isNaN(hours)) return value;
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${suffix}`;
}
