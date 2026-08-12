import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';

import { GetBatchQuery } from './get-batch.query';
import { GetBatchResult } from './get-batch.result';

export class GetBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(query: GetBatchQuery): Promise<GetBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    if (query.onlyActive && !batch.isActive) {
      throw new BaseException(
        ERROR_CODES.BATCH_NOT_FOUND,
        'Batch not found',
        404,
      );
    }

    return GetBatchResult.fromEntity(batch);
  }
}