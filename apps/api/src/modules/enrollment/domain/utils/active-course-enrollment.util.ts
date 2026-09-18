import { EnrollmentStatus } from '../enums/enrollment-status.enum';
import { Enrollment } from '../entities/enrollment.entity';
import type { EnrollmentDetailView } from '../repositories/enrollment.repository';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toValidDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Batch calendar end used for same-course re-enrollment eligibility. */
export function resolveEnrollmentBatchEndDate(
  enrollment: Pick<
    EnrollmentDetailView,
    'expectedCompletionDate' | 'batchTiming' | 'batch'
  >,
): Date | null {
  const candidates = [
    toValidDate(enrollment.batch?.endDate),
    toValidDate(enrollment.batchTiming?.endDate),
    toValidDate(enrollment.expectedCompletionDate),
  ].filter((value): value is Date => value !== null);

  if (!candidates.length) {
    return null;
  }

  // Use the latest end date so a short timing cannot unblock the batch early.
  return candidates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

/**
 * True while the student still has a current enrollment for this course
 * whose batch end date has not yet passed (inclusive of the end date).
 */
export function isActiveCourseEnrollmentBlocking(
  enrollment: Pick<
    EnrollmentDetailView,
    | 'isDeleted'
    | 'status'
    | 'expectedCompletionDate'
    | 'batchTiming'
    | 'batch'
  >,
  referenceDate: Date = new Date(),
): boolean {
  if (enrollment.isDeleted) {
    return false;
  }

  if (!Enrollment.isCurrentStatus(enrollment.status as EnrollmentStatus)) {
    return false;
  }

  const endDate = resolveEnrollmentBatchEndDate(enrollment);
  if (!endDate) {
    return true;
  }

  return startOfDay(referenceDate).getTime() <= startOfDay(endDate).getTime();
}

export function formatEnrollmentEndDateLabel(endDate: Date): string {
  return endDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
