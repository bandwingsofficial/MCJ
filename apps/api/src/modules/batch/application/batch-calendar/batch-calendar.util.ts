import {
  BatchCalendarExceptionStatus,
  CourseMode,
  DayOfWeek,
} from '@prisma/client';

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const DAY_ORDER: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun',
};

export const BATCH_MODE_ORDER: CourseMode[] = [
  CourseMode.OFFLINE,
  CourseMode.ONLINE,
  CourseMode.RECORDED,
];

export const BATCH_MODE_LABELS: Record<CourseMode, string> = {
  [CourseMode.OFFLINE]: 'Offline / Classroom',
  [CourseMode.ONLINE]: 'Online',
  [CourseMode.RECORDED]: 'Self-Paced / Recorded',
};

export type BatchCalendarDayType =
  | 'WORKING'
  | 'SUNDAY'
  | 'NON_WORKING'
  | 'HOLIDAY'
  | 'OUTSIDE_PERIOD'
  | 'FUTURE';

export interface BatchCalendarExceptionRecord {
  dateKey: string;
  status: BatchCalendarExceptionStatus;
  reason?: string | null;
}

export interface BatchModeScheduleConfig {
  daysOfWeek: DayOfWeek[];
  isAnytime: boolean;
  scheduleLabel: string;
  startDate: Date;
  endDate: Date | null;
}

export interface BatchCalendarSummary {
  totalCalendarDays: number;
  workingDays: number;
  sundays: number;
  nonWorkingDays: number;
  holidays: number;
  completedPassedDays: number;
}

export interface BatchCalendarDayCell {
  dateKey: string;
  day: number;
  inMonth: boolean;
  dayType: BatchCalendarDayType;
  reason?: string | null;
  isEditable: boolean;
  hasException: boolean;
}

export function parseCourseMode(value: string): CourseMode | null {
  const normalized = value.trim().toUpperCase();
  if (
    normalized === CourseMode.OFFLINE ||
    normalized === CourseMode.ONLINE ||
    normalized === CourseMode.RECORDED
  ) {
    return normalized as CourseMode;
  }
  return null;
}

export function dateKeyFromDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function dateFromDateKey(dateKey: string): Date {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(Date.UTC(year, (month || 1) - 1, day || 1));
}

export function todayDateKey(): string {
  return dateKeyFromDate(new Date());
}

export function parseMonthKey(monthKey: string): { year: number; month: number } {
  const [year, month] = monthKey.split('-').map(Number);
  return { year: year || 1970, month: month || 1 };
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const { year, month } = parseMonthKey(monthKey);
  const date = new Date(Date.UTC(year, month - 1 + delta, 1));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

export function formatMonthLabel(monthKey: string): string {
  const { year, month } = parseMonthKey(monthKey);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatDaysOfWeekLabel(daysOfWeek: DayOfWeek[]): string {
  if (!daysOfWeek.length) {
    return '—';
  }

  const ordered = DAY_ORDER.filter((day) => daysOfWeek.includes(day));
  if (ordered.length === 1) {
    return DAY_SHORT[ordered[0]!];
  }

  const firstIndex = DAY_ORDER.indexOf(ordered[0]!);
  const lastIndex = DAY_ORDER.indexOf(ordered[ordered.length - 1]!);
  const isContiguous = lastIndex - firstIndex + 1 === ordered.length;

  if (isContiguous) {
    return `${DAY_SHORT[ordered[0]!]}-${DAY_SHORT[ordered[ordered.length - 1]!]}`;
  }

  return ordered.map((day) => DAY_SHORT[day]).join(', ');
}

export function unionDaysOfWeek(
  values: DayOfWeek[][],
): DayOfWeek[] {
  const set = new Set<DayOfWeek>();
  for (const list of values) {
    for (const day of list) {
      set.add(day);
    }
  }
  return DAY_ORDER.filter((day) => set.has(day));
}

export function iterateDateKeys(startDate: Date, endDate: Date): string[] {
  const keys: string[] = [];
  const cursor = new Date(
    Date.UTC(
      startDate.getUTCFullYear(),
      startDate.getUTCMonth(),
      startDate.getUTCDate(),
    ),
  );
  const end = new Date(
    Date.UTC(
      endDate.getUTCFullYear(),
      endDate.getUTCMonth(),
      endDate.getUTCDate(),
    ),
  );

  while (cursor <= end) {
    keys.push(dateKeyFromDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return keys;
}

export function resolveBaseDayType(params: {
  dateKey: string;
  config: BatchModeScheduleConfig;
  exception?: BatchCalendarExceptionRecord;
  todayKey?: string;
}): BatchCalendarDayType {
  const { dateKey, config, exception } = params;
  const todayKey = params.todayKey ?? todayDateKey();
  const startKey = dateKeyFromDate(config.startDate);
  const endKey = config.endDate ? dateKeyFromDate(config.endDate) : null;

  if (dateKey < startKey || (endKey && dateKey > endKey)) {
    return 'OUTSIDE_PERIOD';
  }

  if (exception) {
    if (exception.status === BatchCalendarExceptionStatus.HOLIDAY) {
      return 'HOLIDAY';
    }
    if (exception.status === BatchCalendarExceptionStatus.NON_WORKING) {
      return 'NON_WORKING';
    }
    if (exception.status === BatchCalendarExceptionStatus.WORKING) {
      return dateKey > todayKey ? 'FUTURE' : 'WORKING';
    }
  }

  const weekday = dateFromDateKey(dateKey).getUTCDay();
  if (weekday === 0) {
    return 'SUNDAY';
  }

  if (config.isAnytime) {
    return dateKey > todayKey ? 'FUTURE' : 'WORKING';
  }

  const allowed = new Set(
    config.daysOfWeek.map((day) => DAY_INDEX[day]),
  );
  if (!allowed.has(weekday)) {
    return 'NON_WORKING';
  }

  return dateKey > todayKey ? 'FUTURE' : 'WORKING';
}

export function isCalendarWorkingDayType(dayType: BatchCalendarDayType): boolean {
  return (
    dayType === 'WORKING' ||
    dayType === 'FUTURE'
  );
}

export function isCalendarWorkingDay(params: {
  dateKey: string;
  config: BatchModeScheduleConfig;
  exception?: BatchCalendarExceptionRecord;
  todayKey?: string;
}): boolean {
  const dayType = resolveBaseDayType(params);
  return dayType === 'WORKING' || dayType === 'FUTURE';
}

export function computeCalendarSummary(params: {
  config: BatchModeScheduleConfig;
  exceptions: BatchCalendarExceptionRecord[];
  todayKey?: string;
}): BatchCalendarSummary {
  const todayKey = params.todayKey ?? todayDateKey();
  const endDate =
    params.config.endDate ??
    dateFromDateKey(todayKey);
  const dateKeys = iterateDateKeys(params.config.startDate, endDate);
  const exceptionMap = new Map(
    params.exceptions.map((row) => [row.dateKey, row]),
  );

  let workingDays = 0;
  let sundays = 0;
  let nonWorkingDays = 0;
  let holidays = 0;
  let completedPassedDays = 0;

  for (const dateKey of dateKeys) {
    const dayType = resolveBaseDayType({
      dateKey,
      config: params.config,
      exception: exceptionMap.get(dateKey),
      todayKey,
    });

    if (dateKey <= todayKey) {
      completedPassedDays += 1;
    }

    switch (dayType) {
      case 'WORKING':
      case 'FUTURE':
        workingDays += 1;
        break;
      case 'SUNDAY':
        sundays += 1;
        break;
      case 'HOLIDAY':
        holidays += 1;
        break;
      case 'NON_WORKING':
        nonWorkingDays += 1;
        break;
      default:
        break;
    }
  }

  return {
    totalCalendarDays: dateKeys.length,
    workingDays,
    sundays,
    nonWorkingDays,
    holidays,
    completedPassedDays,
  };
}

export function buildCalendarMonthGrid(params: {
  monthKey: string;
  config: BatchModeScheduleConfig;
  exceptions: BatchCalendarExceptionRecord[];
  todayKey?: string;
}): BatchCalendarDayCell[] {
  const todayKey = params.todayKey ?? todayDateKey();
  const { year, month } = parseMonthKey(params.monthKey);
  const firstOfMonth = new Date(Date.UTC(year, month - 1, 1));
  const mondayBasedIndex = (firstOfMonth.getUTCDay() + 6) % 7;
  const gridStart = new Date(Date.UTC(year, month - 1, 1 - mondayBasedIndex));
  const exceptionMap = new Map(
    params.exceptions.map((row) => [row.dateKey, row]),
  );

  const cells: BatchCalendarDayCell[] = [];
  for (let index = 0; index < 42; index += 1) {
    const cursor = new Date(gridStart);
    cursor.setUTCDate(gridStart.getUTCDate() + index);
    const dateKey = dateKeyFromDate(cursor);
    const day = cursor.getUTCDate();
    const inMonth = cursor.getUTCMonth() === month - 1;
    const dayType = resolveBaseDayType({
      dateKey,
      config: params.config,
      exception: exceptionMap.get(dateKey),
      todayKey,
    });
    const reason = exceptionMap.get(dateKey)?.reason ?? null;
    const hasException = exceptionMap.has(dateKey);
    const isEditable =
      dayType !== 'OUTSIDE_PERIOD' &&
      dayType !== 'SUNDAY';

    cells.push({
      dateKey,
      day,
      inMonth,
      dayType,
      reason,
      isEditable,
      hasException,
    });
  }

  return cells;
}

export interface CalendarDateRangeSummary {
  workingDayKeys: string[];
  workingDays: number;
  sundays: number;
  nonWorkingDays: number;
  holidays: number;
  totalCalendarDays: number;
}

export function summarizeCalendarDateRange(params: {
  config: BatchModeScheduleConfig;
  exceptions: BatchCalendarExceptionRecord[];
  from: string;
  to: string;
  enrollmentStartKey?: string;
  includeFuture?: boolean;
  todayKey?: string;
}): CalendarDateRangeSummary {
  const todayKey = params.todayKey ?? todayDateKey();
  const endDate =
    params.config.endDate ??
    dateFromDateKey(todayKey);
  const allKeys = iterateDateKeys(params.config.startDate, endDate);
  const exceptionMap = new Map(
    params.exceptions.map((row) => [row.dateKey, row]),
  );
  const includeFuture = params.includeFuture ?? false;
  const enrollmentStartKey = params.enrollmentStartKey;

  const workingDayKeys: string[] = [];
  let sundays = 0;
  let nonWorkingDays = 0;
  let holidays = 0;
  let totalCalendarDays = 0;

  for (const dateKey of allKeys) {
    if (dateKey < params.from || dateKey > params.to) continue;
    if (enrollmentStartKey && dateKey < enrollmentStartKey) continue;
    if (dateKey > todayKey) continue;

    const dayType = resolveBaseDayType({
      dateKey,
      config: params.config,
      exception: exceptionMap.get(dateKey),
      todayKey,
    });

    if (dayType === 'OUTSIDE_PERIOD') continue;

    totalCalendarDays += 1;

    if (dayType === 'WORKING' || (includeFuture && dayType === 'FUTURE')) {
      workingDayKeys.push(dateKey);
      continue;
    }

    switch (dayType) {
      case 'SUNDAY':
        sundays += 1;
        break;
      case 'HOLIDAY':
        holidays += 1;
        break;
      case 'NON_WORKING':
        nonWorkingDays += 1;
        break;
      default:
        break;
    }
  }

  return {
    workingDayKeys,
    workingDays: workingDayKeys.length,
    sundays,
    nonWorkingDays,
    holidays,
    totalCalendarDays,
  };
}

export function listWorkingDayDateKeys(params: {
  config: BatchModeScheduleConfig;
  exceptions: BatchCalendarExceptionRecord[];
  from?: string;
  to?: string;
  todayKey?: string;
  includeFuture?: boolean;
}): string[] {
  const todayKey = params.todayKey ?? todayDateKey();
  const endDate =
    params.config.endDate ??
    dateFromDateKey(todayKey);
  const allKeys = iterateDateKeys(params.config.startDate, endDate);
  const exceptionMap = new Map(
    params.exceptions.map((row) => [row.dateKey, row]),
  );
  const includeFuture = params.includeFuture ?? false;

  return allKeys.filter((dateKey) => {
    if (params.from && dateKey < params.from) return false;
    if (params.to && dateKey > params.to) return false;

    const dayType = resolveBaseDayType({
      dateKey,
      config: params.config,
      exception: exceptionMap.get(dateKey),
      todayKey,
    });

    if (dayType === 'WORKING') {
      return true;
    }

    if (includeFuture && dayType === 'FUTURE') {
      return true;
    }

    return false;
  });
}

export function batchCalendarDayCellClass(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case 'WORKING':
      return 'border-emerald-200 bg-emerald-50 text-emerald-950';
    case 'FUTURE':
      return 'border-sky-200 bg-sky-50 text-sky-950';
    case 'SUNDAY':
      return 'border-violet-200 bg-violet-50 text-violet-950';
    case 'NON_WORKING':
      return 'border-slate-200 bg-slate-100 text-slate-600';
    case 'HOLIDAY':
      return 'border-amber-200 bg-amber-50 text-amber-950';
    case 'OUTSIDE_PERIOD':
    default:
      return 'border-slate-100 bg-slate-50 text-slate-400';
  }
}

export function calendarAttendanceBlockMessage(
  dayType: BatchCalendarDayType,
): string | null {
  switch (dayType) {
    case 'HOLIDAY':
      return 'Attendance cannot be taken because this date is marked as a Holiday in the batch calendar.';
    case 'SUNDAY':
      return 'Attendance cannot be taken on Sundays for this batch calendar.';
    case 'NON_WORKING':
      return 'Attendance cannot be taken because this date is marked as a Non-Working Day in the batch calendar.';
    case 'OUTSIDE_PERIOD':
      return 'Attendance cannot be taken because this date is outside the batch period.';
    case 'FUTURE':
      return 'Attendance cannot be taken for a future date.';
    case 'WORKING':
    default:
      return null;
  }
}

export function batchCalendarDayLabel(dayType: BatchCalendarDayType): string {
  switch (dayType) {
    case 'WORKING':
      return 'Working Day';
    case 'FUTURE':
      return 'Future';
    case 'SUNDAY':
      return 'Sunday';
    case 'NON_WORKING':
      return 'Non-Working Day';
    case 'HOLIDAY':
      return 'Holiday';
    case 'OUTSIDE_PERIOD':
    default:
      return 'Outside Period';
  }
}
