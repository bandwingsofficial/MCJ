import type { DashboardDatePreset } from "@/src/features/dashboard/types/branch-dashboard.types";

function toLocalDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

  if (preset === "THIS_YEAR") {
    const from = new Date(today.getFullYear(), 0, 1);
    return { from: toLocalDateInput(from), to: toLocalDateInput(today) };
  }

  if (preset === "ALL_TIME") {
    return {};
  }

  return {
    from: customFrom || undefined,
    to: customTo || undefined,
  };
}

export function formatDashboardPeriodLabel(from: string, to: string): string {
  if (from === to) {
    return formatShortDate(from);
  }
  return `${formatShortDate(from)} – ${formatShortDate(to)}`;
}

export function formatShortDate(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.getFullYear() < 2000) return "—";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  const hours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(diffMs / 86_400_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDateTime(value);
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: amount >= 100_000 ? 0 : 2,
  }).format(amount);
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}
