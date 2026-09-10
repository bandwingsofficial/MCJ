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

export function batchCalendarDayCellClass(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case "WORKING":
      return "border-emerald-200 bg-emerald-50 text-emerald-950";
    case "FUTURE":
      return "border-sky-200 bg-sky-50 text-sky-950";
    case "SUNDAY":
      return "border-violet-200 bg-violet-50 text-violet-950";
    case "NON_WORKING":
      return "border-slate-200 bg-slate-100 text-slate-600";
    case "HOLIDAY":
      return "border-amber-200 bg-amber-50 text-amber-950";
    case "OUTSIDE_PERIOD":
    default:
      return "border-slate-100 bg-slate-50 text-slate-400";
  }
}

export function batchCalendarDayLabel(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case "WORKING":
      return "Working Day";
    case "FUTURE":
      return "Future";
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
  dayType: BatchCalendarDayType;
  label: string;
}> = [
  { dayType: "WORKING", label: "Working Day" },
  { dayType: "SUNDAY", label: "Sunday" },
  { dayType: "NON_WORKING", label: "Non-Working Day" },
  { dayType: "HOLIDAY", label: "Holiday" },
  { dayType: "FUTURE", label: "Future" },
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

export function initialCalendarMonthKey(startDate: string): string {
  return startDate.slice(0, 7);
}
