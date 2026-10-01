import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';
import { BatchStatus } from '../../domain/enums/batch-status.enum';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { calculateBatchLifecycleStatus } from '../../domain/utils/batch-lifecycle-status.util';
import { GetBatchHandler } from '../get-batch/get-batch.handler';
import { GetBatchQuery } from '../get-batch/get-batch.query';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { CancelBatchCommand } from './cancel-batch.command';

export class CancelBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
    private readonly getBatchHandler: GetBatchHandler,
  ) {}

  async execute(command: CancelBatchCommand): Promise<GetBatchResult> {
    const reason = command.reason?.trim();

    if (!reason) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Cancellation reason is required',
        400,
      );
    }

    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.batchId),
    );

    if (batch.status === BatchStatus.CANCELLED) {
      throw new BaseException(
        ERROR_CODES.BATCH_CANCELLED,
        'Batch is already cancelled',
        400,
      );
    }

    if (batch.isDeleted) {
      throw new BaseException(
        ERROR_CODES.BATCH_DELETED,
        'Batch is archived',
        400,
      );
    }

    const lifecycle = calculateBatchLifecycleStatus({
      startDate: batch.startDate,
      startTime: batch.startTime,
      endDate: batch.endDate,
      endTime: batch.endTime,
    });

    if (lifecycle !== BatchStatus.ONGOING) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only ongoing batches can be cancelled',
        400,
      );
    }

    batch.cancel(reason, command.updatedBy);
    await this.batchRepo.save(batch);

    notifyDomainMutation({
      domain: 'batch',
      action: 'status_changed',
      entityId: batch.id,
    });

    return this.getBatchHandler.execute(
      new GetBatchQuery(batch.id, true),
    );
  }
}
