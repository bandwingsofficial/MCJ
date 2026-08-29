import { BatchStatus } from '../enums/batch-status.enum';
import type { Batch } from '../entities/batch.entity';
import { BatchNotSelectableException } from '../errors/batch-business.exception';

export const BATCH_NOT_SELECTABLE_MESSAGE =
  'Completed or expired batches cannot be selected.';

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** True when the batch calendar end date is before today. */
export function isBatchDateExpired(
  batch: Pick<Batch, 'endDate' | 'startDate'>,
  referenceDate: Date = new Date(),
): boolean {
  const end = batch.endDate ?? batch.startDate;
  if (!end) {
    return false;
  }

  return startOfDay(referenceDate).getTime() > startOfDay(end).getTime();
}

/** COMPLETED status or calendar-expired (UI "Expired"). */
export function isBatchCompletedOrExpired(
  batch: Pick<Batch, 'status' | 'endDate' | 'startDate'>,
  referenceDate: Date = new Date(),
): boolean {
  return (
    batch.status === BatchStatus.COMPLETED || isBatchDateExpired(batch, referenceDate)
  );
}

/**
 * Batches allowed for new enrollments / student or faculty assignments.
 * UPCOMING and ONGOING remain selectable unless completed or date-expired.
 */
export function isBatchSelectableForAssignment(
  batch: Pick<
    Batch,
    'status' | 'endDate' | 'startDate' | 'isActive' | 'isDeleted'
  >,
  referenceDate: Date = new Date(),
): boolean {
  if (batch.isDeleted || !batch.isActive) {
    return false;
  }

  if (
    batch.status === BatchStatus.CANCELLED ||
    batch.status === BatchStatus.ARCHIVED
  ) {
    return false;
  }

  return !isBatchCompletedOrExpired(batch, referenceDate);
}

export function ensureBatchSelectableForAssignment(
  batch: Pick<
    Batch,
    'status' | 'endDate' | 'startDate' | 'isActive' | 'isDeleted'
  >,
  referenceDate: Date = new Date(),
): void {
  if (isBatchSelectableForAssignment(batch, referenceDate)) {
    return;
  }

  if (isBatchCompletedOrExpired(batch, referenceDate)) {
    throw new BatchNotSelectableException();
  }

  if (!batch.isActive) {
    throw new BatchNotSelectableException(
      'Batch is inactive and cannot be selected.',
    );
  }

  if (batch.isDeleted || batch.status === BatchStatus.ARCHIVED) {
    throw new BatchNotSelectableException(
      'Batch is not available for selection.',
    );
  }

  if (batch.status === BatchStatus.CANCELLED) {
    throw new BatchNotSelectableException('Batch has been cancelled.');
  }

  throw new BatchNotSelectableException();
}

export function getBatchSelectionBlockReason(
  batch: Pick<
    Batch,
    'status' | 'endDate' | 'startDate' | 'isActive' | 'isDeleted'
  >,
  referenceDate: Date = new Date(),
): 'COMPLETED' | 'EXPIRED' | 'CANCELLED' | 'ARCHIVED' | 'INACTIVE' | null {
  if (batch.isDeleted || batch.status === BatchStatus.ARCHIVED) {
    return 'ARCHIVED';
  }

  if (!batch.isActive) {
    return 'INACTIVE';
  }

  if (batch.status === BatchStatus.CANCELLED) {
    return 'CANCELLED';
  }

  if (batch.status === BatchStatus.COMPLETED) {
    return 'COMPLETED';
  }

  if (isBatchDateExpired(batch, referenceDate)) {
    return 'EXPIRED';
  }

  return null;
}
