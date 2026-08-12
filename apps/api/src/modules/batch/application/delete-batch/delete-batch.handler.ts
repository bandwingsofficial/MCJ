import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';

import { DeleteBatchCommand } from './delete-batch.command';
import { DeleteBatchResult } from './delete-batch.result';

export class DeleteBatchHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: DeleteBatchCommand,
  ): Promise<DeleteBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id),
    );

    batch.softDelete(command.deletedBy);
    await this.batchRepo.save(batch);

    return new DeleteBatchResult(
      batch.id,
      true,
      batch.deletedAt,
    );
  }
}
