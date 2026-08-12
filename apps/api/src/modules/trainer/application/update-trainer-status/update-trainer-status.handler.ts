import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { GetTrainerResult } from '../get-trainer/get-trainer.result';

import { UpdateTrainerStatusCommand } from './update-trainer-status.command';

export class UpdateTrainerStatusHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: UpdateTrainerStatusCommand,
  ): Promise<GetTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id),
    );

    if (command.activate) {
      trainer.activate(command.updatedBy);
    } else {
      trainer.deactivate(command.updatedBy);
    }

    await this.trainerRepo.save(trainer);

    return GetTrainerResult.fromEntity(trainer);
  }
}
