import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export type ResolvedBatchTimingScope = {
  timingId: string;
  batchId: string;
  requestedBatchId: string;
  batchIdCorrected: boolean;
};

/**
 * Resolves a batch timing by id. If the timing exists but belongs to a
 * different batch than requestedBatchId, returns the canonical batch id so
 * callers can still serve the record instead of failing with a false 404.
 */
export async function resolveBatchTimingScope(
  prisma: PrismaService,
  requestedBatchId: string,
  timingId: string,
): Promise<ResolvedBatchTimingScope | null> {
  const strictMatch = await prisma.batchTiming.findFirst({
    where: {
      id: timingId,
      batchId: requestedBatchId,
      isDeleted: false,
    },
    select: {
      id: true,
      batchId: true,
    },
  });

  if (strictMatch) {
    return {
      timingId: strictMatch.id,
      batchId: strictMatch.batchId,
      requestedBatchId,
      batchIdCorrected: false,
    };
  }

  const timing = await prisma.batchTiming.findFirst({
    where: {
      id: timingId,
      isDeleted: false,
    },
    select: {
      id: true,
      batchId: true,
    },
  });

  if (!timing) {
    return null;
  }

  return {
    timingId: timing.id,
    batchId: timing.batchId,
    requestedBatchId,
    batchIdCorrected: timing.batchId !== requestedBatchId,
  };
}
