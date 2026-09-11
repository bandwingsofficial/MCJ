import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Palmtree,
  Sun,
  XCircle,
} from "lucide-react";

import type { BatchCalendarSummary } from "@/src/features/batches/types/batch.types";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export type BatchCalendarDayType =
  | "WORKING"
  | "SUNDAY"
  | "NON_WORKING"
  | "HOLIDAY"
  | "OUTSIDE_PERIOD"
  | "FUTURE";

export function formatBatchCalendarDate(value: string): string {
  const dateKey = value.slice(0, 10);
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1)).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    },
  );
}

export function formatBatchCalendarDayName(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, (month || 1) - 1, day || 1)).getUTCDay();
  return DAY_NAMES[weekday] ?? "—";
}

export function currentCalendarDateKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function currentCalendarMonthKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

export function resolveBatchCalendarDisplayDayType(
  dayType: BatchCalendarDayType,
): Exclude<BatchCalendarDayType, "FUTURE"> {
  if (dayType === "FUTURE") {
    return "WORKING";
  }

  return dayType;
}

export function batchCalendarCellDisplayLabel(
  dayType: BatchCalendarDayType,
  reason?: string | null,
): { primary: string; secondary?: string } {
  if (dayType === "HOLIDAY") {
    const trimmed = reason?.trim();
    return {
      primary: "Holiday",
      secondary: trimmed || undefined,
    };
  }

  if (dayType === "FUTURE") {
    return { primary: "Working Day", secondary: "Upcoming" };
  }

  return { primary: batchCalendarDayLabel(dayType) };
}

export function batchCalendarDayCellClass(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case "WORKING":
      return "border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 to-[#F6FDF9] text-emerald-900";
    case "FUTURE":
      return "border-sky-200/80 bg-gradient-to-br from-sky-50/80 to-[#F7FBFF] text-sky-900";
    case "SUNDAY":
      return "border-violet-200/80 bg-gradient-to-br from-violet-50/80 to-[#FAF8FF] text-violet-900";
    case "NON_WORKING":
      return "border-slate-200/80 bg-gradient-to-br from-slate-100/90 to-slate-50 text-slate-600";
    case "HOLIDAY":
      return "border-amber-200/80 bg-gradient-to-br from-amber-50/90 to-[#FFFBF5] text-amber-900";
    case "OUTSIDE_PERIOD":
    default:
      return "border-slate-100 bg-slate-50/80 text-slate-400";
  }
}

export function batchCalendarLegendSwatchClass(
  dayType: Exclude<BatchCalendarDayType, "FUTURE">,
): string {
  switch (dayType) {
    case "WORKING":
      return "bg-emerald-100 ring-emerald-200/80";
    case "SUNDAY":
      return "bg-violet-100 ring-violet-200/80";
    case "NON_WORKING":
      return "bg-slate-200 ring-slate-300/80";
    case "HOLIDAY":
      return "bg-amber-100 ring-amber-200/80";
    case "OUTSIDE_PERIOD":
    default:
      return "bg-slate-100 ring-slate-200/80";
  }
}

export function batchCalendarDayLabel(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case "WORKING":
      return "Working Day";
    case "FUTURE":
      return "Working Day";
    case "SUNDAY":
      return "Sunday";
    case "NON_WORKING":
      return "Non-Working Day";
    case "HOLIDAY":
      return "Holiday";
    case "OUTSIDE_PERIOD":
    default:
      return "Outside Period";
  }
}

export const BATCH_CALENDAR_LEGEND: Array<{
  dayType: Exclude<BatchCalendarDayType, "FUTURE">;
  label: string;
}> = [
  { dayType: "WORKING", label: "Working Day" },
  { dayType: "SUNDAY", label: "Sunday" },
  { dayType: "HOLIDAY", label: "Holiday" },
  { dayType: "NON_WORKING", label: "Non-Working Day" },
  { dayType: "OUTSIDE_PERIOD", label: "Outside Period" },
];

export function batchCalendarSummaryRows(
  summary: BatchCalendarSummary,
): Array<{ label: string; value: number }> {
  return [
    { label: "Total Calendar Days", value: summary.totalCalendarDays },
    { label: "Working Days", value: summary.workingDays },
    { label: "Sundays", value: summary.sundays },
    { label: "Non-Working Days", value: summary.nonWorkingDays },
    { label: "Holidays", value: summary.holidays },
    { label: "Completed/Passed Days", value: summary.completedPassedDays },
  ];
}

export interface BatchCalendarSummaryMetric {
  key: string;
  label: string;
  value: number;
  icon: LucideIcon;
  iconClass: string;
  iconBgClass: string;
  cardClass: string;
}

export function batchCalendarSummaryMetrics(
  summary: BatchCalendarSummary,
): BatchCalendarSummaryMetric[] {
  return [
    {
      key: "total",
      label: "Total Calendar Days",
      value: summary.totalCalendarDays,
      icon: CalendarRange,
      iconClass: "text-[#2563EB]",
      iconBgClass: "bg-blue-50/90 ring-blue-100/80",
      cardClass:
        "border-[#C7D9F5] bg-gradient-to-br from-[#F8FBFF] via-[#F3F8FF] to-[#EAF2FB]",
    },
    {
      key: "working",
      label: "Working Days",
      value: summary.workingDays,
      icon: CheckCircle2,
      iconClass: "text-emerald-600",
      iconBgClass: "bg-emerald-50/90 ring-emerald-100/80",
      cardClass:
        "border-emerald-200/70 bg-gradient-to-br from-emerald-50/50 via-[#F6FDF9] to-[#EDFAF3]",
    },
    {
      key: "sundays",
      label: "Sundays",
      value: summary.sundays,
      icon: Sun,
      iconClass: "text-violet-600",
      iconBgClass: "bg-violet-50/90 ring-violet-100/80",
      cardClass:
        "border-violet-200/80 bg-gradient-to-br from-violet-50/70 via-violet-50/40 to-[#FAF8FF]",
    },
    {
      key: "non-working",
      label: "Non-Working Days",
      value: summary.nonWorkingDays,
      icon: XCircle,
      iconClass: "text-slate-600",
      iconBgClass: "bg-slate-100/90 ring-slate-200/80",
      cardClass:
        "border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-slate-50/80",
    },
    {
      key: "holidays",
      label: "Holidays",
      value: summary.holidays,
      icon: Palmtree,
      iconClass: "text-amber-700",
      iconBgClass: "bg-amber-50/90 ring-amber-100/80",
      cardClass:
        "border-amber-200/70 bg-gradient-to-br from-amber-50/60 via-[#FFFBF5] to-[#FFF8ED]",
    },
    {
      key: "completed",
      label: "Completed/Passed Days",
      value: summary.completedPassedDays,
      icon: CalendarDays,
      iconClass: "text-sky-600",
      iconBgClass: "bg-sky-50/90 ring-sky-100/80",
      cardClass:
        "border-sky-200/70 bg-gradient-to-br from-sky-50/60 via-[#F7FBFF] to-[#EFF8FF]",
    },
  ];
}

export function initialCalendarMonthKey(startDate: string): string {
  return startDate.slice(0, 7);
}
