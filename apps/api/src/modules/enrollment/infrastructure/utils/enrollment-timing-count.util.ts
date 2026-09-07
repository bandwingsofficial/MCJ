import type { Prisma } from '@prisma/client';

import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { BatchFullException } from '../../domain/errors/batch-full.exception';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';

/** Statuses that keep an enrollment linked to its batch timing seat. */
export const TIMING_LINKED_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.PENDING,
  EnrollmentStatus.PENDING_APPROVAL,
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

/** Statuses that occupy a parent batch seat. */
export const BATCH_SEAT_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
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
  prisma: PrismaService,
  batchTimingId: string,
): Promise<number> {
  return prisma.enrollment.count({
    where: buildTimingLinkedEnrollmentWhere(batchTimingId),
  });
}

export async function syncBatchTimingEnrolledCount(
  prisma: PrismaService,
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
  prisma: PrismaService,
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
  prisma: PrismaService,
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

  if (liveCount >= timing.capacity) {
    throw new BatchFullException();
  }
}
