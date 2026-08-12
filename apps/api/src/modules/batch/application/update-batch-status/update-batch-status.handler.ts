import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { UpdateBatchStatusCommand } from './update-batch-status.command';

export class UpdateBatchStatusHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
  command: UpdateBatchStatusCommand,
): Promise<GetBatchResult> {
  const batch = await this.domainService.ensureExists(
    await this.batchRepo.findById(command.id),
  );

  if (command.activate) {
    batch.activate(command.updatedBy);
  } else {
    batch.deactivate(command.updatedBy);
  }

  await this.batchRepo.save(batch);

  const updatedBatch =
    await this.domainService.ensureExists(
      await this.batchRepo.findById(batch.id),
    );

  return GetBatchResult.fromEntity(updatedBatch);
}
}
