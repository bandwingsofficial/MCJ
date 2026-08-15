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
      const nextDisplayOrder =
        (await this.trainerRepo.getMaxActiveDisplayOrder()) + 1;

      trainer.changeDisplayOrder(nextDisplayOrder);
      trainer.activate(command.updatedBy);
    } else {
      if (trainer.displayOrder != null) {
        await this.trainerRepo.closeDisplayOrderGap(
          trainer.displayOrder,
        );
      }

      trainer.changeDisplayOrder(null);
      trainer.deactivate(command.updatedBy);
    }

    await this.trainerRepo.save(trainer);

    return GetTrainerResult.fromEntity(trainer);
  }
}
