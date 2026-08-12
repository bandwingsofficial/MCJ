import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';

import { PermanentDeleteBatchCommand } from './permanent-delete-batch.command';
import { PermanentDeleteBatchResult } from './permanent-delete-batch.result';

export class PermanentDeleteBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: PermanentDeleteBatchCommand,
  ): Promise<PermanentDeleteBatchResult> {
    await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id, true),
    );

    await this.batchRepo.deletePermanent(command.id);

    return new PermanentDeleteBatchResult(command.id, true);
    // Note: We can also publish an event here if needed, e.g., BatchPermanentlyDeletedEvent
  }
}
