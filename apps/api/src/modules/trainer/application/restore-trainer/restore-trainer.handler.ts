import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { RestoreTrainerCommand } from './restore-trainer.command';

export class RestoreTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: RestoreTrainerCommand,
  ): Promise<GetTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id, true),
    );

    const nextDisplayOrder =
      (await this.trainerRepo.getMaxDisplayOrder()) + 1;

    trainer.restore(command.updatedBy);
    trainer.changeDisplayOrder(nextDisplayOrder);

    await this.trainerRepo.save(trainer);

    return GetTrainerResult.fromEntity(trainer);
  }
}
