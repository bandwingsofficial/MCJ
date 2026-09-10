import { AttendanceStatus } from '@prisma/client';

export interface AttendanceStatusCounts {
  present: number;
  absent: number;
  late: number;
  leave: number;
  /** Total attendance rows for the student in scope. */
  total: number;
}

export interface AttendanceAnalyticsStats extends AttendanceStatusCounts {
  /** Present + Late (existing domain rule for "attended"). */
  attended: number;
  conductedSessions: number;
  percentage: number | null;
  ratioLabel: string | null;
  hasAttendance: boolean;
}

/** Existing domain rule: Late counts as attended alongside Present. */
export function countAttended(counts: Pick<AttendanceStatusCounts, 'present' | 'late'>): number {
  return counts.present + counts.late;
}

export function buildAttendanceAnalyticsStats(
  counts: AttendanceStatusCounts,
  conductedSessions: number,
): AttendanceAnalyticsStats {
  const attended = countAttended(counts);
  const hasAttendance = counts.total > 0;
  const safeConducted = Math.max(0, conductedSessions);

  if (!hasAttendance || safeConducted === 0) {
    return {
      ...counts,
      attended,
      conductedSessions: safeConducted,
      percentage: null,
      ratioLabel: null,
      hasAttendance,
    };
  }

  return {
    ...counts,
    attended,
    conductedSessions: safeConducted,
    percentage: Math.round((attended / safeConducted) * 10000) / 100,
    ratioLabel: `${attended} / ${safeConducted}`,
    hasAttendance: true,
  };
}

export function emptyStatusCounts(): AttendanceStatusCounts {
  return {
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    total: 0,
  };
}

/** Present-only attendance rate for timing-scoped summaries. */
export function buildPresentOnlyPercentage(
  present: number,
  totalRecords: number,
): number {
  return totalRecords > 0
    ? Math.round((present / totalRecords) * 1000) / 10
    : 0;
}

export function applyStatusCount(
  counts: AttendanceStatusCounts,
  status: AttendanceStatus,
  amount = 1,
): void {
  counts.total += amount;
  if (status === AttendanceStatus.PRESENT) counts.present += amount;
  if (status === AttendanceStatus.ABSENT) counts.absent += amount;
  if (status === AttendanceStatus.LATE) counts.late += amount;
  if (status === AttendanceStatus.LEAVE) counts.leave += amount;
}

/** One session per date; first qualifying record wins (matches student detail summary). */
export function buildSessionSummaryFromAttendanceRows(
  rows: Array<{ date: Date; status: AttendanceStatus }>,
): AttendanceAnalyticsStats {
  const statusBySessionDate = new Map<string, AttendanceStatus>();
  for (const row of rows) {
    if (
      row.status !== AttendanceStatus.PRESENT &&
      row.status !== AttendanceStatus.ABSENT &&
      row.status !== AttendanceStatus.LATE
    ) {
      continue;
    }
    const dateKey = row.date.toISOString().slice(0, 10);
    if (!statusBySessionDate.has(dateKey)) {
      statusBySessionDate.set(dateKey, row.status);
    }
  }

  const sessionCounts = emptyStatusCounts();
  for (const status of statusBySessionDate.values()) {
    applyStatusCount(sessionCounts, status);
  }

  return buildAttendanceAnalyticsStats(
    sessionCounts,
    statusBySessionDate.size,
  );
}

export function monthKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function monthLabelFromKey(key: string): string {
  const [year, month] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, (month || 1) - 1, 1));
  return date.toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}
