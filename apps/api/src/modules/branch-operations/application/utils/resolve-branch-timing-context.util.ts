import { NotFoundException } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { BaseException } from '@common/exceptions/base.exception';
import type { BatchStatus } from '@modules/batch/domain/enums/batch-status.enum';
import {
  ensureBatchSelectableForAssignment,
} from '@modules/batch/domain/utils/batch-selection.util';
import { resolveBatchTimingScope } from '@modules/batch/infrastructure/utils/resolve-batch-timing-scope.util';

import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { toAttendanceSessionDto } from '../attendance-session.util';
import type { BranchOperationsAccessService } from '../branch-operations-access.service';

type ResolveBranchTimingContextOptions = {
  forWrite: boolean;
};

export async function resolveBranchBatchTimingContext(
  prisma: PrismaService,
  access: BranchOperationsAccessService,
  user: BranchAuthUser,
  requestedBatchId: string,
  batchTimingId: string,
  options: ResolveBranchTimingContextOptions,
) {
  const scope = await resolveBatchTimingScope(
    prisma,
    requestedBatchId,
    batchTimingId,
  );

  if (!scope) {
    throw new NotFoundException('Batch timing not found');
  }

  await access.assertFacultyCanAccessBatch(user, scope.batchId);

  const timing = await prisma.batchTiming.findFirst({
    where: {
      id: scope.timingId,
      batchId: scope.batchId,
      isDeleted: false,
    },
    include: {
      batch: {
        select: {
          id: true,
          name: true,
          code: true,
          branchId: true,
          courseId: true,
          status: true,
          startDate: true,
          endDate: true,
          isActive: true,
          isDeleted: true,
          branch: {
            select: { id: true, branchName: true, branchCode: true },
          },
          course: {
            select: { id: true, title: true, code: true },
          },
        },
      },
    },
  });

  if (!timing) {
    throw new NotFoundException('Batch timing not found');
  }

  if (timing.batch.branchId !== user.branchId) {
    throw new BaseException(
      ERROR_CODES.BRANCH_ACCESS_DENIED,
      'Branch access denied',
      403,
    );
  }

  if (options.forWrite) {
    ensureBatchSelectableForAssignment({
      status: timing.batch.status as BatchStatus,
      startDate: timing.batch.startDate,
      endDate: timing.batch.endDate,
      isActive: timing.batch.isActive,
      isDeleted: timing.batch.isDeleted,
    });
  }

  const courseId = timing.batch.course?.id ?? timing.batch.courseId;
  if (!courseId) {
    throw new NotFoundException('Batch course not found for this batch timing');
  }

  const assignment = await prisma.batchCourse.findFirst({
    where: {
      batchId: scope.batchId,
      courseId,
      isDeleted: false,
    },
    include: {
      course: { select: { id: true, title: true, code: true } },
      session: { select: { id: true, sessionNumber: true } },
    },
  });

  if (!assignment) {
    throw new NotFoundException(
      'Course assignment not found for this batch timing',
    );
  }

  return {
    scope,
    batch: {
      id: timing.batch.id,
      name: timing.batch.name,
      code: timing.batch.code,
    },
    branch: timing.batch.branch,
    timing: {
      id: timing.id,
      name: timing.name,
      mode: timing.mode,
    },
    batchCourseId: assignment.id,
    session: toAttendanceSessionDto({
      batchCourseId: assignment.id,
      sessionId: assignment.session?.id,
      sessionNumber: assignment.session?.sessionNumber,
      courseId: assignment.course.id,
      courseTitle: assignment.course.title,
      courseCode: assignment.course.code,
    }),
  };
}
