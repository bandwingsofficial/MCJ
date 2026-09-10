import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { resolveBatchTimingScope } from '../../infrastructure/utils/resolve-batch-timing-scope.util';
import { countTimingLinkedEnrollments } from '@modules/enrollment/infrastructure/utils/enrollment-timing-count.util';
import { GetBatchResult } from '../get-batch/get-batch.result';
import { GetBatchQuery } from '../get-batch/get-batch.query';
import { GetBatchHandler } from '../get-batch/get-batch.handler';

export class UpdateBatchTimingHandler {
  constructor(
    private readonly prisma: PrismaService,
    private readonly getBatchHandler: GetBatchHandler,
  ) {}

  async execute(params: {
    batchId: string;
    timingId: string;
    capacity: number;
    updatedBy?: string;
  }): Promise<GetBatchResult> {
    if (!params.capacity || params.capacity < 1) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Capacity must be at least 1',
        400,
      );
    }

    const scope = await resolveBatchTimingScope(
      this.prisma,
      params.batchId,
      params.timingId,
    );

    if (!scope) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch timing not found for this batch',
        404,
      );
    }

    const timing = await this.prisma.batchTiming.findFirst({
      where: {
        id: scope.timingId,
        batchId: scope.batchId,
        isDeleted: false,
      },
      select: {
        id: true,
        enrolledCount: true,
      },
    });

    if (!timing) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch timing not found for this batch',
        404,
      );
    }

    const linkedEnrollmentCount = await countTimingLinkedEnrollments(
      this.prisma,
      timing.id,
    );

    if (params.capacity < linkedEnrollmentCount) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Capacity cannot be lower than the number of enrolled students',
        400,
      );
    }

    await this.prisma.batchTiming.update({
      where: { id: timing.id },
      data: {
        capacity: params.capacity,
        updatedBy: params.updatedBy ?? null,
      },
    });

    return this.getBatchHandler.execute(
      new GetBatchQuery(scope.batchId, true),
    );
  }
}
