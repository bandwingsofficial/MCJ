import { randomUUID } from 'crypto';
import type { TrainerRepository } from '@modules/trainer/domain/repositories/trainer.repository';

import { BatchTrainer } from '../../domain/entities/batch-trainer.entity';
import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';
import { GetBatchResult } from '../get-batch/get-batch.result';

import { AssignBatchTrainersCommand } from './assign-batch-trainers.command';

export class AssignBatchTrainersHandler {
  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: AssignBatchTrainersCommand,
  ): Promise<GetBatchResult> {
    const batch = await this.domainService.ensureExists(
      await this.batchRepo.findById(command.id),
    );
    const trainerIds = this.domainService.uniqueIds(command.trainerIds);

    if (trainerIds.length > 0) {
      await this.domainService.ensureActiveTrainers(
        this.trainerRepo,
        trainerIds,
      );
    }

    batch.update({
      trainers: trainerIds.map((trainerId) =>
        BatchTrainer.create({
          id: randomUUID(),
          batchId: batch.id,
          trainerId,
        }),
      ),
      updatedBy: command.updatedBy,
    });

    await this.batchRepo.save(batch);

    const updatedBatch =
      await this.domainService.ensureExists(
        await this.batchRepo.findById(batch.id),
      );

    return GetBatchResult.fromEntity(updatedBatch);
  }
}
