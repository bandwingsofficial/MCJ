import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import {
  ensureBatchCanDeactivateOrArchive,
  ensureBatchOpenForLifecycleMutation,
} from '../../domain/utils/batch-selection.util';

import { notifyDomainMutation } from '../../../../infrastructure/realtime/realtime-notify';

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
      ensureBatchOpenForLifecycleMutation(batch);
    } else {
      ensureBatchCanDeactivateOrArchive(batch, 'deactivate');
    }

    if (command.activate) {
      if (!batch.isActive) {
        batch.changeDisplayOrder(
          (await this.batchRepo.getMaxDisplayOrder()) + 1,
        );
      }
      batch.activate(command.updatedBy);
    } else {
      if (batch.displayOrder != null) {
        await this.batchRepo.closeDisplayOrderGap(batch.displayOrder);
      }
      batch.deactivate(command.updatedBy);
    }

    await this.batchRepo.save(batch);

    const updatedBatch =
      await this.domainService.ensureExists(
        await this.batchRepo.findById(batch.id),
      );

    notifyDomainMutation({
      domain: 'batch',
      action: 'status_changed',
      entityId: batch.id,
    });

    return GetBatchResult.fromEntity(updatedBatch);
  }
}
