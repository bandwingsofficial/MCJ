import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import {
  BatchTrainerResult,
  BatchTimingResult,
  GetBatchResult,
} from '../get-batch/get-batch.result';

export async function attachBranchAssignedTrainersToBatchList(
  prisma: PrismaService,
  items: GetBatchResult[],
  courseId?: string,
): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const batchIds = items.map((item) => item.id);

  const rows = await prisma.branchTrainer.findMany({
    where: {
      assignmentType: 'COURSE_BATCH',
      batchId: { in: batchIds },
      batchTimingId: { not: null },
      ...(courseId ? { courseId } : {}),
      trainer: { isDeleted: false },
    },
    select: {
      branchId: true,
      batchTimingId: true,
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
        },
      },
    },
  });

  const trainersByTimingId = new Map<
    string,
    Record<string, BatchTrainerResult[]>
  >();

  for (const row of rows) {
    const timingId = row.batchTimingId;
    if (!timingId) {
      continue;
    }

    const byBranch =
      trainersByTimingId.get(timingId) ?? ({} as Record<string, BatchTrainerResult[]>);
    const trainerList = byBranch[row.branchId] ?? [];

    const mapped = new BatchTrainerResult(
      row.trainer.id,
      row.trainer.firstName,
      row.trainer.lastName,
      row.trainer.employeeCode,
    );

    if (!trainerList.some((trainer) => trainer.id === mapped.id)) {
      trainerList.push(mapped);
    }

    byBranch[row.branchId] = trainerList;
    trainersByTimingId.set(timingId, byBranch);
  }

  for (const item of items) {
    for (const timing of item.timings) {
      const branchAssignedTrainers = trainersByTimingId.get(timing.id);
      if (!branchAssignedTrainers) {
        continue;
      }

      (
        timing as BatchTimingResult & {
          branchAssignedTrainers?: Record<string, BatchTrainerResult[]>;
        }
      ).branchAssignedTrainers = branchAssignedTrainers;
    }
  }
}
