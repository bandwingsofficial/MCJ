import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

import {
  BatchTrainerResult,
  BatchTimingResult,
  GetBatchResult,
} from '../get-batch/get-batch.result';

type BranchTrainerAssignmentRow = {
  timingId: string;
  branchId: string;
  mode: string | null;
  trainer: BatchTrainerResult;
};

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
      trainer: {
        isDeleted: false,
        status: 'ACTIVE',
      },
    },
    select: {
      branchId: true,
      batchTimingId: true,
      mode: true,
      trainer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          qualification: true,
          specialization: true,
          bio: true,
          experienceYears: true,
          trainerType: true,
          profileImageUrl: true,
        },
      },
    },
  });

  const assignments: BranchTrainerAssignmentRow[] = [];

  for (const row of rows) {
    const timingId = row.batchTimingId;
    if (!timingId) {
      continue;
    }

    assignments.push({
      timingId,
      branchId: row.branchId,
      mode: row.mode,
      trainer: new BatchTrainerResult(
        row.trainer.id,
        row.trainer.firstName,
        row.trainer.lastName,
        row.trainer.employeeCode,
        row.trainer.qualification,
        row.trainer.specialization,
        row.trainer.bio,
        row.trainer.experienceYears ?? 0,
        row.trainer.trainerType,
        row.trainer.profileImageUrl,
      ),
    });
  }

  for (const item of items) {
    for (const timing of item.timings) {
      const byBranch: Record<string, BatchTrainerResult[]> = {};

      for (const assignment of assignments) {
        if (assignment.timingId !== timing.id) {
          continue;
        }

        if (assignment.mode && assignment.mode !== timing.mode) {
          continue;
        }

        const trainerList = byBranch[assignment.branchId] ?? [];
        if (
          !trainerList.some((trainer) => trainer.id === assignment.trainer.id)
        ) {
          trainerList.push(assignment.trainer);
        }
        byBranch[assignment.branchId] = trainerList;
      }

      if (Object.keys(byBranch).length === 0) {
        continue;
      }

      (
        timing as BatchTimingResult & {
          branchAssignedTrainers?: Record<string, BatchTrainerResult[]>;
        }
      ).branchAssignedTrainers = byBranch;
    }
  }
}
