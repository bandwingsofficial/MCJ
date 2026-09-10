import type {
  AttendanceItem,
  BatchTimingStudentAttendanceRow,
} from "@/src/features/branch-ops/types";
import {
  currentMonthKey,
  formatMonthLabel,
  parseMonthKey,
  toDateKey,
} from "@/src/features/branch-ops/utils/attendance-calendar.utils";
import {
  resolveAttendanceDateRange,
  todayLocalInput,
} from "@/src/features/branch-ops/utils/attendance-date.utils";

export interface MonthlyAttendanceStudentInput {
  id: string;
  enrollmentId: string;
  studentCode: string;
  name: string;
  enrollmentDate?: string | null;
}

export interface MonthlyAttendanceStudentRow {
  studentId: string;
  enrollmentId: string;
  studentCode: string;
  studentName: string;
  workingSessions: number;
  present: number;
  absent: number;
  late: number;
  percentage: number | null;
}

export interface MonthlyAttendanceSummary {
  enrolledStudents: number;
  workingSessions: number;
  present: number;
  absent: number;
  late: number;
  overallPercentage: number | null;
}

export type MonthlyCalendarDayStatus =
  | "PRESENT"
  | "ABSENT"
  | "LATE"
  | "NO_SESSION"
  | "FUTURE"
  | "OUT_OF_RANGE";

export interface MonthlyCalendarDay {
  dateKey: string;
  day: number;
  inMonth: boolean;
  status: MonthlyCalendarDayStatus;
}

export function currentMonthlyAttendanceRange(): { from: string; to: string } {
  const range = resolveAttendanceDateRange("THIS_MONTH");
  return {
    from: range.from ?? "",
    to: range.to ?? "",
  };
}

export function normalizeDateKey(value: string): string {
  return value.slice(0, 10);
}

export function enrollmentStartDateKey(
  enrollmentDate: string | null | undefined,
  monthFrom: string,
): string {
  const enrollmentKey = enrollmentDate
    ? normalizeDateKey(enrollmentDate)
    : monthFrom;
  return enrollmentKey > monthFrom ? enrollmentKey : monthFrom;
}

export function extractSessionDates(records: AttendanceItem[]): string[] {
  const dates = new Set<string>();
  for (const record of records) {
    dates.add(normalizeDateKey(String(record.date)));
  }
  return Array.from(dates).sort();
}

export function mapTimingStudentRowToMonthlyRow(
  row: BatchTimingStudentAttendanceRow,
): MonthlyAttendanceStudentRow {
  return {
    studentId: row.id,
    enrollmentId: row.enrollmentId,
    studentCode: row.studentCode,
    studentName: row.name,
    workingSessions: row.conductedSessions,
    present: row.present,
    absent: row.absent,
    late: row.late,
    percentage: row.hasAttendance ? row.percentage : null,
  };
}

/** Mirrors backend buildSessionSummaryFromRows: one session per date. */
export function buildSessionSummaryFromAttendanceRecords(
  records: AttendanceItem[],
  options?: {
    monthFrom?: string;
    monthTo?: string;
    enrollmentStart?: string;
  },
): {
  workingSessions: number;
  present: number;
  absent: number;
  late: number;
  percentage: number | null;
} {
  const statusByDate = new Map<string, AttendanceItem["status"]>();

  for (const record of records) {
    const dateKey = normalizeDateKey(String(record.date));
    if (options?.monthFrom && dateKey < options.monthFrom) continue;
    if (options?.monthTo && dateKey > options.monthTo) continue;
    if (options?.enrollmentStart && dateKey < options.enrollmentStart) continue;
    if (
      record.status !== "PRESENT" &&
      record.status !== "ABSENT" &&
      record.status !== "LATE"
    ) {
      continue;
    }
    if (!statusByDate.has(dateKey)) {
      statusByDate.set(dateKey, record.status);
    }
  }

  let present = 0;
  let absent = 0;
  let late = 0;
  for (const status of statusByDate.values()) {
    if (status === "PRESENT") present += 1;
    else if (status === "ABSENT") absent += 1;
    else if (status === "LATE") late += 1;
  }

  const workingSessions = statusByDate.size;

  return {
    workingSessions,
    present,
    absent,
    late,
    percentage: buildMonthlyAttendancePercentage(present, late, workingSessions),
  };
}

export function buildMonthlyAttendancePercentage(
  present: number,
  late: number,
  workingSessions: number,
): number | null {
  if (workingSessions <= 0) return null;
  return Math.round(((present + late) / workingSessions) * 10000) / 100;
}

export function formatMonthlyAttendancePercentage(
  value: number | null,
): string {
  if (value == null) return "—";
  return `${value.toFixed(2)}%`;
}

export function buildMonthlyStudentRows(params: {
  students: MonthlyAttendanceStudentInput[];
  records: AttendanceItem[];
}): MonthlyAttendanceStudentRow[] {
  const { students, records } = params;

  return students.map((student) => {
    const studentRecords = records.filter(
      (record) => record.student.id === student.id,
    );

    const summary = buildSessionSummaryFromAttendanceRecords(studentRecords);

    return {
      studentId: student.id,
      enrollmentId: student.enrollmentId,
      studentCode: student.studentCode,
      studentName: student.name,
      ...summary,
    };
  });
}

export function buildMonthlyAttendanceSummary(
  rows: MonthlyAttendanceStudentRow[],
  batchWorkingSessions: number,
): MonthlyAttendanceSummary {
  const present = rows.reduce((sum, row) => sum + row.present, 0);
  const absent = rows.reduce((sum, row) => sum + row.absent, 0);
  const late = rows.reduce((sum, row) => sum + row.late, 0);
  const totalApplicableSessions = rows.reduce(
    (sum, row) => sum + row.workingSessions,
    0,
  );

  return {
    enrolledStudents: rows.length,
    workingSessions: batchWorkingSessions,
    present,
    absent,
    late,
    overallPercentage: buildMonthlyAttendancePercentage(
      present,
      late,
      totalApplicableSessions,
    ),
  };
}

function resolveCalendarStatus(params: {
  dateKey: string;
  todayKey: string;
  enrollmentStart: string;
  sessionDates: Set<string>;
  studentStatusByDate: Map<string, AttendanceItem["status"]>;
}): MonthlyCalendarDayStatus {
  const { dateKey, todayKey, enrollmentStart, sessionDates, studentStatusByDate } =
    params;

  if (dateKey < enrollmentStart) {
    return "OUT_OF_RANGE";
  }

  if (dateKey > todayKey) {
    return "FUTURE";
  }

  if (!sessionDates.has(dateKey)) {
    return "NO_SESSION";
  }

  const status = studentStatusByDate.get(dateKey);
  if (status === "PRESENT" || status === "ABSENT" || status === "LATE") {
    return status;
  }

  return "NO_SESSION";
}

export function buildMonthlyCalendarDays(params: {
  monthKey: string;
  monthFrom: string;
  monthTo: string;
  enrollmentDate?: string | null;
  sessionDates: string[];
  records: AttendanceItem[];
  studentId: string;
}): MonthlyCalendarDay[] {
  const {
    monthKey,
    monthFrom,
    monthTo,
    enrollmentDate,
    sessionDates,
    records,
    studentId,
  } = params;
  const enrollmentStart = enrollmentStartDateKey(enrollmentDate, monthFrom);
  const sessionDateSet = new Set(sessionDates);
  const todayKey = todayLocalInput();

  const studentStatusByDate = new Map<string, AttendanceItem["status"]>();
  for (const record of records) {
    if (record.student.id !== studentId) continue;
    const dateKey = normalizeDateKey(String(record.date));
    if (dateKey < monthFrom || dateKey > monthTo) continue;
    if (
      record.status === "PRESENT" ||
      record.status === "ABSENT" ||
      record.status === "LATE"
    ) {
      studentStatusByDate.set(dateKey, record.status);
    }
  }

  const { year, month } = parseMonthKey(monthKey);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const mondayBasedIndex = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - mondayBasedIndex));

  const cells: MonthlyCalendarDay[] = [];
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
      status: inMonth
        ? resolveCalendarStatus({
            dateKey,
            todayKey,
            enrollmentStart,
            sessionDates: sessionDateSet,
            studentStatusByDate,
          })
        : "OUT_OF_RANGE",
    });
  }

  return cells;
}

export function currentMonthlyAttendanceLabel(): string {
  return formatMonthLabel(currentMonthKey());
}
