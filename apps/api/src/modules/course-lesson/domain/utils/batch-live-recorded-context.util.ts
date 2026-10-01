import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { LessonContentType } from '../enums/lesson-content-type.enum';
import type { PrismaService } from '../../../../infrastructure/prisma/prisma.service';

export async function assertBatchLiveRecordedContext(
  prisma: PrismaService,
  params: {
    branchId: string;
    batchId: string;
    moduleId: string;
    contentType?: LessonContentType;
  },
): Promise<void> {
  if (params.contentType !== LessonContentType.LIVE_RECORDED_VIDEO) {
    return;
  }

  const branchId = params.branchId.trim();
  const batchId = params.batchId.trim();

  if (!branchId || !batchId) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'branchId and batchId are required for live recorded videos',
      400,
    );
  }

  const assignment = await prisma.branchBatch.findUnique({
    where: {
      branchId_batchId: {
        branchId,
        batchId,
      },
    },
  });

  if (!assignment) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Batch is not assigned to this branch',
      400,
    );
  }

  const [batch, module] = await Promise.all([
    prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false },
      select: { id: true, courseId: true },
    }),
    prisma.courseModule.findFirst({
      where: { id: params.moduleId, isDeleted: false },
      select: { id: true, courseId: true },
    }),
  ]);

  if (!batch) {
    throw new BaseException(ERROR_CODES.BATCH_NOT_FOUND, 'Batch not found', 404);
  }

  if (!module) {
    throw new BaseException(
      ERROR_CODES.COURSE_MODULE_NOT_FOUND,
      'Course module not found',
      404,
    );
  }

  if (!batch.courseId || batch.courseId !== module.courseId) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Batch course does not match the lesson module course',
      400,
    );
  }
}

export function assertLiveRecordedBatchScope(
  lesson: { contentType: LessonContentType; batchId: string | null; branchId: string | null },
  expected?: { batchId?: string; branchId?: string },
): void {
  if (lesson.contentType !== LessonContentType.LIVE_RECORDED_VIDEO) {
    return;
  }

  if (!lesson.batchId || !lesson.branchId) {
    return;
  }

  if (!expected?.batchId && !expected?.branchId) {
    return;
  }

  if (expected.batchId && lesson.batchId !== expected.batchId) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Live recorded video does not belong to this batch',
      403,
    );
  }

  if (expected.branchId && lesson.branchId !== expected.branchId) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Live recorded video does not belong to this branch',
      403,
    );
  }
}
