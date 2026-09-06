import type {
  BatchDurationType,
  DayOfWeek,
} from "@/src/features/batches/types/batch.types";

const DAY_OF_WEEK_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

export function parseLocalDate(value: string): Date | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const [yearRaw, monthRaw, dayRaw] = trimmed.split("-");
  const year = Number(yearRaw);
  const month = Number(monthRaw);
  const day = Number(dayRaw);

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function isEndDateBeforeStartDate(
  startDate: string,
  endDate: string,
): boolean {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end) {
    return false;
  }

  return end.getTime() < start.getTime();
}

function toDateInputValue(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

/** Adds months without rolling over, so 31 Jan + 1 month lands on 28/29 Feb. */
function addMonths(date: Date, months: number): Date {
  const day = date.getDate();
  const shifted = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const lastDayOfMonth = new Date(
    shifted.getFullYear(),
    shifted.getMonth() + 1,
    0,
  ).getDate();

  shifted.setDate(Math.min(day, lastDayOfMonth));

  return shifted;
}

/**
 * End date implied by the start date plus the configured duration, e.g.
 * 10 Sep 2026 + 2 Months = 10 Nov 2026. Hour-based durations have no day
 * equivalent, so they return null and leave the end date to the admin.
 */
export function deriveEndDate(
  startDate: string,
  durationValue: number | null | undefined,
  durationType: BatchDurationType | null | undefined,
): string | null {
  const start = parseLocalDate(startDate);
  const value = Number(durationValue);

  if (!start || !durationType || !Number.isFinite(value) || value <= 0) {
    return null;
  }

  switch (durationType) {
    case "DAYS":
      start.setDate(start.getDate() + value);
      return toDateInputValue(start);
    case "WEEKS":
      start.setDate(start.getDate() + value * 7);
      return toDateInputValue(start);
    case "MONTHS":
      return toDateInputValue(addMonths(start, value));
    case "YEARS":
      return toDateInputValue(addMonths(start, value * 12));
    default:
      return null;
  }
}

export function calculateTotalWorkingDays(
  startDate: string,
  endDate: string,
  daysOfWeek: DayOfWeek[],
): number | null {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  if (!start || !end || end.getTime() < start.getTime() || !daysOfWeek.length) {
    return null;
  }

  const workingDayIndexes = new Set(
    daysOfWeek.map((day) => DAY_OF_WEEK_INDEX[day]),
  );

  let count = 0;
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    if (workingDayIndexes.has(cursor.getDay())) {
      count += 1;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return count;
}

export function formatTotalWorkingDaysLabel(count: number | null): string {
  if (count === null) {
    return "";
  }

  return `${count} Working Day${count === 1 ? "" : "s"}`;
}

