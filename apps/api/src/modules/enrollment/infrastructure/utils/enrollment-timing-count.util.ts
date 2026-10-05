import type { Prisma } from '@prisma/client';

import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { BatchFullException } from '../../domain/errors/batch-full.exception';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

type EnrollmentCountClient = PrismaService | Prisma.TransactionClient;

/** Statuses that occupy a parent batch seat. */
export const BATCH_SEAT_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADVANCED,
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

/**
 * Statuses counted against a batch timing's capacity.
 * Cancelled / completed / pending enrollments are excluded.
 */
export const TIMING_LINKED_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADVANCED,
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

export function isTimingLinkedEnrollmentStatus(
  status: EnrollmentStatus,
): boolean {
  return TIMING_LINKED_ENROLLMENT_STATUSES.includes(status);
}

export function buildTimingLinkedEnrollmentWhere(
  batchTimingId: string,
): Prisma.EnrollmentWhereInput {
  return {
    batchTimingId,
    isDeleted: false,
    status: { in: TIMING_LINKED_ENROLLMENT_STATUSES },
  };
}

export async function countTimingLinkedEnrollments(
  prisma: EnrollmentCountClient,
  batchTimingId: string,
): Promise<number> {
  return prisma.enrollment.count({
    where: buildTimingLinkedEnrollmentWhere(batchTimingId),
  });
}

export function calculateTimingAvailableSeats(
  capacity: number,
  enrolledCount: number,
): number {
  return Math.max(0, capacity - enrolledCount);
}

export function hasTimingCapacityAvailable(
  capacity: number,
  enrolledCount: number,
): boolean {
  return calculateTimingAvailableSeats(capacity, enrolledCount) > 0;
}

export async function syncBatchTimingEnrolledCount(
  prisma: EnrollmentCountClient,
  batchTimingId: string,
): Promise<void> {
  const liveCount = await countTimingLinkedEnrollments(
    prisma,
    batchTimingId,
  );

  await prisma.batchTiming.updateMany({
    where: { id: batchTimingId, isDeleted: false },
    data: { enrolledCount: liveCount },
  });
}

export async function syncAllBatchTimingEnrolledCounts(
  prisma: EnrollmentCountClient,
  batchId: string,
): Promise<void> {
  const timings = await prisma.batchTiming.findMany({
    where: { batchId, isDeleted: false },
    select: { id: true },
  });

  await Promise.all(
    timings.map((timing) =>
      syncBatchTimingEnrolledCount(prisma, timing.id),
    ),
  );
}

export async function assertBatchTimingHasLiveCapacity(
  prisma: EnrollmentCountClient,
  batchTimingId: string,
): Promise<void> {
  const timing = await prisma.batchTiming.findFirst({
    where: { id: batchTimingId, isDeleted: false },
    select: { capacity: true },
  });

  if (!timing) {
    return;
  }

  const liveCount = await countTimingLinkedEnrollments(
    prisma,
    batchTimingId,
  );

  if (!hasTimingCapacityAvailable(timing.capacity, liveCount)) {
    throw new BatchFullException();
  }
}
