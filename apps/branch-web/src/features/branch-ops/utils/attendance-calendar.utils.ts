/** Calendar helpers for student attendance details. */

const DAY_INDEX: Record<string, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export type AttendanceCalendarStatus = "PRESENT" | "ABSENT" | "LATE";

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
  isWorkingDay: boolean;
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

function isWorkingDay(
  dateKey: string,
  daysOfWeek: string[],
): boolean {
  if (!daysOfWeek.length) return false;
  const allowed = new Set(
    daysOfWeek
      .map((day) => DAY_INDEX[day])
      .filter((value) => value !== undefined),
  );
  if (!allowed.size) return false;
  const [year, month, day] = dateKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, (month || 1) - 1, day || 1)).getUTCDay();
  return allowed.has(weekday);
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

export function buildAttendanceCalendarDays(params: {
  monthKey: string;
  daysOfWeek: string[];
  startDate?: string | null;
  endDate?: string | null;
  history: Array<{
    id: string;
    date: string;
    status: string;
    session: { label: string };
    course: { title: string };
  }>;
}): AttendanceCalendarDay[] {
  const { monthKey, daysOfWeek, startDate, endDate, history } = params;
  const { year, month } = parseMonthKey(monthKey);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

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

    cells.push({
      dateKey,
      day,
      inMonth,
      isWorkingDay: isWorkingDay(dateKey, daysOfWeek),
      inBatchRange: isInBatchRange(dateKey, startDate, endDate),
      sessions: sessionsByDate.get(dateKey) ?? [],
    });
  }

  return cells;
}

export function statusDotClass(status: AttendanceCalendarStatus): string {
  if (status === "PRESENT") return "bg-emerald-500";
  if (status === "ABSENT") return "bg-red-500";
  return "bg-amber-400";
}

export function summarizeDaySessions(sessions: AttendanceCalendarSessionRecord[]) {
  return {
    present: sessions.filter((row) => row.status === "PRESENT").length,
    absent: sessions.filter((row) => row.status === "ABSENT").length,
    late: sessions.filter((row) => row.status === "LATE").length,
  };
}
