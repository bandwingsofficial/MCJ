import type { Batch, DayOfWeek } from "@/src/features/batches/types/batch.types";
import {
  calculateTotalWorkingDays,
  parseLocalDate,
} from "@/src/features/batches/utils/batch-schedule.utils";
import {
  formatBatchDate,
  formatBatchDateRange,
  formatBatchTiming,
} from "@/src/features/batches/utils/batch.helper";
import { DAYS_OF_WEEK } from "@/src/features/batches/constants/batch.constants";

const DAY_OF_WEEK_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function countWorkingDaysBetween(
  rangeStart: Date,
  rangeEnd: Date,
  daysOfWeek: DayOfWeek[],
): number {
  if (rangeEnd.getTime() < rangeStart.getTime() || !daysOfWeek.length) {
    return 0;
  }

  const workingDayIndexes = new Set(
    daysOfWeek.map((day) => DAY_OF_WEEK_INDEX[day]),
  );

  let count = 0;
  const cursor = new Date(rangeStart);

  while (cursor.getTime() <= rangeEnd.getTime()) {
    if (workingDayIndexes.has(cursor.getDay())) {
      count += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

function formatDayCount(count: number | null, label: string): string {
  if (count === null) {
    return "—";
  }

  return `${count} ${label}${count === 1 ? "" : "s"}`;
}

export interface BatchProgressInfo {
  calendarDurationLabel: string;
  totalWorkingDays: number | null;
  daysCompleted: number | null;
  daysRemaining: number | null;
  daysUntilStart: number | null;
  progressPercent: number | null;
  isExpired: boolean;
  isNotStarted: boolean;
  progressLabel: string;
}

export function calculateBatchProgress(
  batch: Pick<
    Batch,
    "startDate" | "endDate" | "daysOfWeek" | "startTime" | "endTime"
  >,
  referenceDate: Date = new Date(),
): BatchProgressInfo {
  const start = parseLocalDate(batch.startDate.split("T")[0] ?? batch.startDate);
  const end = parseLocalDate(
    (batch.endDate ?? batch.startDate).split("T")[0] ??
      batch.endDate ??
      batch.startDate,
  );
  const today = startOfDay(referenceDate);

  const calendarDurationLabel = formatBatchDateRange(
    batch.startDate,
    batch.endDate,
  );

  const totalWorkingDays = calculateTotalWorkingDays(
    batch.startDate.split("T")[0] ?? batch.startDate,
    (batch.endDate ?? batch.startDate).split("T")[0] ??
      batch.endDate ??
      batch.startDate,
    batch.daysOfWeek,
  );

  if (!start || !end) {
    return {
      calendarDurationLabel,
      totalWorkingDays,
      daysCompleted: null,
      daysRemaining: null,
      daysUntilStart: null,
      progressPercent: null,
      isExpired: false,
      isNotStarted: false,
      progressLabel: "—",
    };
  }

  const isExpired = today.getTime() > end.getTime();
  const isNotStarted = today.getTime() < start.getTime();

  let daysCompleted = 0;
  let daysRemaining = totalWorkingDays ?? 0;
  let daysUntilStart: number | null = null;

  if (isNotStarted) {
    daysCompleted = 0;
    daysRemaining = totalWorkingDays ?? 0;
    daysUntilStart = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
    );
  } else if (isExpired) {
    daysCompleted = totalWorkingDays ?? 0;
    daysRemaining = 0;
  } else {
    const completedEnd = today.getTime() > end.getTime() ? end : today;
    daysCompleted = countWorkingDaysBetween(start, completedEnd, batch.daysOfWeek);

    const nextDay = new Date(today);
    nextDay.setDate(nextDay.getDate() + 1);

    if (nextDay.getTime() <= end.getTime()) {
      daysRemaining = countWorkingDaysBetween(nextDay, end, batch.daysOfWeek);
    } else {
      daysRemaining = 0;
    }
  }

  const progressPercent =
    totalWorkingDays && totalWorkingDays > 0
      ? Math.min(100, Math.round((daysCompleted / totalWorkingDays) * 100))
      : null;

  let progressLabel = "—";
  if (isExpired) {
    progressLabel = "Expired";
  } else if (isNotStarted) {
    progressLabel = "Not started";
  } else if (progressPercent !== null) {
    progressLabel = `${progressPercent}% complete`;
  }

  return {
    calendarDurationLabel,
    totalWorkingDays,
    daysCompleted,
    daysRemaining,
    daysUntilStart,
    progressPercent,
    isExpired,
    isNotStarted,
    progressLabel,
  };
}

export function formatBatchDaysLabel(days: DayOfWeek[]): string {
  if (!days?.length) {
    return "—";
  }

  const labels = new Map(
    DAYS_OF_WEEK.map((day) => [day.value, day.label]),
  );

  return days.map((day) => labels.get(day) ?? day).join(", ");
}

export function formatBatchOverviewTiming(
  startTime: string,
  endTime: string,
): string {
  return formatBatchTiming(startTime, endTime);
}

export function formatBatchOverviewDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }

  return formatBatchDate(value);
}

export function formatBatchDurationLabel(
  batch: Pick<Batch, "startDate" | "endDate">,
): string {
  const start = parseLocalDate(batch.startDate.split("T")[0] ?? batch.startDate);
  const end = parseLocalDate(
    (batch.endDate ?? batch.startDate).split("T")[0] ??
      batch.endDate ??
      batch.startDate,
  );

  if (!start || !end) {
    return "";
  }

  const diffMs = end.getTime() - start.getTime();
  const dayCount = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return `${dayCount} day${dayCount === 1 ? "" : "s"}`;
}

export function formatProgressDayLabel(
  count: number | null,
  singular: string,
): string {
  return formatDayCount(count, singular);
}
