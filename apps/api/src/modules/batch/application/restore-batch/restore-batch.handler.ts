import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { RestoreBatchCommand } from './restore-batch.command';

export class RestoreBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: RestoreBatchCommand,
  ): Promise<GetBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id, true),
    );

    batch.restore(command.updatedBy);

    if (batch.isActive) {
      batch.changeDisplayOrder(
        (await this.batchRepo.getMaxDisplayOrder()) + 1,
      );
    }

    await this.batchRepo.save(batch);

    const restoredBatch =
      await this.domainService.ensureExists(
        await this.batchRepo.findById(batch.id, true),
      );

    return GetBatchResult.fromEntity(restoredBatch);
  }
}
