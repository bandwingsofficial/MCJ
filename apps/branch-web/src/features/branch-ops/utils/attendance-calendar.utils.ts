/** Calendar helpers for student attendance details. */

import type { BatchCalendarDayType } from "@/src/features/branch-ops/types";

export type AttendanceCalendarStatus = "PRESENT" | "ABSENT" | "LATE";

export type AttendanceCalendarDayType =
  | AttendanceCalendarStatus
  | BatchCalendarDayType
  | "NO_ATTENDANCE";

export interface AttendanceCalendarSessionRecord {
  id: string;
  status: AttendanceCalendarStatus;
  sessionLabel: string;
  courseTitle: string;
}

export interface AttendanceCalendarDay {
  dateKey: string;
  day: number;
  inMonth: boolean;
  dayType: AttendanceCalendarDayType;
  inBatchRange: boolean;
  sessions: AttendanceCalendarSessionRecord[];
}

export function monthKeyFromDateKey(dateKey: string): string {
  return dateKey.slice(0, 7);
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split("-").map(Number);
  return { year: year || 1970, month: month || 1 };
}

export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function toDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function monthRangeFromKey(monthKey: string): { from: string; to: string } {
  const { year, month } = parseMonthKey(monthKey);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, "0");
  return {
    from: `${year}-${mm}-01`,
    to: `${year}-${mm}-${String(lastDay).padStart(2, "0")}`,
  };
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function currentMonthKey(): string {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

export function initialCalendarMonth(): string {
  return currentMonthKey();
}

function isInBatchRange(
  dateKey: string,
  startDate?: string | null,
  endDate?: string | null,
): boolean {
  const start = startDate?.slice(0, 10);
  const end = endDate?.slice(0, 10);
  if (start && dateKey < start) return false;
  if (end && dateKey > end) return false;
  return true;
}

function resolveAttendanceDayType(
  calendarDayType: BatchCalendarDayType | undefined,
  attendanceStatus: AttendanceCalendarStatus | null,
): AttendanceCalendarDayType {
  if (
    attendanceStatus === "PRESENT" ||
    attendanceStatus === "ABSENT" ||
    attendanceStatus === "LATE"
  ) {
    return attendanceStatus;
  }

  return calendarDayType ?? "OUTSIDE_PERIOD";
}

export function buildAttendanceCalendarDays(params: {
  monthKey: string;
  startDate?: string | null;
  endDate?: string | null;
  history: Array<{
    id: string;
    date: string;
    status: string;
    session: { label: string };
    course: { title: string };
  }>;
  calendarDayTypes?: Map<string, BatchCalendarDayType>;
}): AttendanceCalendarDay[] {
  const { monthKey, startDate, endDate, history, calendarDayTypes } = params;
  const { year, month } = parseMonthKey(monthKey);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));

  const mondayBasedIndex = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - mondayBasedIndex));

  const sessionsByDate = new Map<string, AttendanceCalendarSessionRecord[]>();
  for (const row of history) {
    const dateKey = String(row.date).slice(0, 10);
    if (row.status !== "PRESENT" && row.status !== "ABSENT" && row.status !== "LATE") {
      continue;
    }
    const list = sessionsByDate.get(dateKey) ?? [];
    list.push({
      id: row.id,
      status: row.status,
      sessionLabel: row.session.label,
      courseTitle: row.course.title,
    });
    sessionsByDate.set(dateKey, list);
  }

  const cells: AttendanceCalendarDay[] = [];
  for (let index = 0; index < 42; index += 1) {
    const cursor = new Date(gridStart);
    cursor.setUTCDate(gridStart.getUTCDate() + index);
    const dateKey = toDateKey(cursor);
    const day = cursor.getUTCDate();
    const inMonth = cursor.getUTCMonth() === month - 1;
    const sessions = sessionsByDate.get(dateKey) ?? [];
    const attendanceStatus = resolveCalendarDayStatus(sessions);
    const calendarDayType = calendarDayTypes?.get(dateKey);

    cells.push({
      dateKey,
      day,
      inMonth,
      dayType: resolveAttendanceDayType(calendarDayType, attendanceStatus),
      inBatchRange: isInBatchRange(dateKey, startDate, endDate),
      sessions,
    });
  }

  return cells;
}

export function statusDotClass(status: AttendanceCalendarStatus): string {
  if (status === "PRESENT") return "bg-emerald-500";
  if (status === "ABSENT") return "bg-red-500";
  return "bg-amber-400";
}

export function resolveCalendarDayStatus(
  sessions: AttendanceCalendarSessionRecord[],
): AttendanceCalendarStatus | null {
  if (!sessions.length) return null;
  if (sessions.some((session) => session.status === "ABSENT")) return "ABSENT";
  if (sessions.some((session) => session.status === "LATE")) return "LATE";
  return "PRESENT";
}

export function calendarDayCellClass(
  dayType: AttendanceCalendarDayType,
): string {
  switch (dayType) {
    case "PRESENT":
      return "border-emerald-200 bg-emerald-100 text-emerald-950";
    case "ABSENT":
      return "border-red-200 bg-red-100 text-red-950";
    case "LATE":
      return "border-amber-200 bg-amber-100 text-amber-950";
    case "WORKING":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
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

export function calendarDayLabel(dayType: AttendanceCalendarDayType): string {
  switch (dayType) {
    case "PRESENT":
      return "Present";
    case "ABSENT":
      return "Absent";
    case "LATE":
      return "Late";
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

export function summarizeDaySessions(sessions: AttendanceCalendarSessionRecord[]) {
  return {
    present: sessions.filter((row) => row.status === "PRESENT").length,
    absent: sessions.filter((row) => row.status === "ABSENT").length,
    late: sessions.filter((row) => row.status === "LATE").length,
  };
}
