import { BatchStatus } from '../enums/batch-status.enum';

export type BatchLifecycleStatus =
  | BatchStatus.UPCOMING
  | BatchStatus.ONGOING
  | BatchStatus.EXPIRED;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Combine a calendar date with an HH:mm time in UTC.
 * Matches the project's existing UTC date conventions.
 */
export function combineUtcDateAndTime(date: Date, time: string): Date {
  const match = TIME_PATTERN.exec(time.trim());
  const hours = match ? Number(match[1]) : 0;
  const minutes = match ? Number(match[2]) : 0;

  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      hours,
      minutes,
      0,
      0,
    ),
  );
}

/**
 * Calculate Upcoming / Ongoing / Expired from start/end date+time.
 * Inclusive at start and end boundaries.
 */
export function calculateBatchLifecycleStatus(params: {
  startDate: Date;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  now?: Date;
}): BatchLifecycleStatus {
  const now = params.now ?? new Date();
  const startAt = combineUtcDateAndTime(params.startDate, params.startTime);
  const endAt = combineUtcDateAndTime(
    params.endDate ?? params.startDate,
    params.endTime,
  );

  if (now.getTime() < startAt.getTime()) {
    return BatchStatus.UPCOMING;
  }

  if (now.getTime() > endAt.getTime()) {
    return BatchStatus.EXPIRED;
  }

  return BatchStatus.ONGOING;
}

export function isBatchLifecycleStatus(
  status: BatchStatus | string | undefined | null,
): status is BatchLifecycleStatus {
  return (
    status === BatchStatus.UPCOMING ||
    status === BatchStatus.ONGOING ||
    status === BatchStatus.EXPIRED
  );
}

/**
 * Resolve the status exposed by the API:
 * - CANCELLED / ARCHIVED (and soft-deleted) keep their stored status
 * - otherwise use date+time lifecycle calculation
 */
export function resolveBatchApiStatus(params: {
  storedStatus: BatchStatus;
  isDeleted?: boolean;
  startDate: Date;
  startTime: string;
  endDate: Date | null;
  endTime: string;
  now?: Date;
}): BatchStatus {
  if (params.isDeleted) {
    return BatchStatus.ARCHIVED;
  }

  if (
    params.storedStatus === BatchStatus.CANCELLED ||
    params.storedStatus === BatchStatus.ARCHIVED
  ) {
    return params.storedStatus;
  }

  return calculateBatchLifecycleStatus(params);
}
