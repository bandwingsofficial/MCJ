function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

/**
 * A job is expired when today's date is after the application deadline date.
 * The deadline date itself remains valid through the end of that day.
 */
export function isJobExpiredByDeadline(
  applicationDeadline: string | Date | null | undefined,
  referenceDate: Date = new Date(),
): boolean {
  if (!applicationDeadline) {
    return false;
  }

  const deadline = new Date(applicationDeadline);
  if (Number.isNaN(deadline.getTime())) {
    return false;
  }

  const today = startOfLocalDay(referenceDate);
  const deadlineDay = startOfLocalDay(deadline);

  return today.getTime() > deadlineDay.getTime();
}
