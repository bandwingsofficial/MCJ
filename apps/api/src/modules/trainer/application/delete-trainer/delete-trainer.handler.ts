import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';

import { DeleteTrainerCommand } from './delete-trainer.command';
import { DeleteTrainerResult } from './delete-trainer.result';

export class DeleteTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: DeleteTrainerCommand,
  ): Promise<DeleteTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id),
    );

    trainer.softDelete(command.deletedBy);
    await this.trainerRepo.save(trainer);

    return new DeleteTrainerResult(
      trainer.id,
      true,
      trainer.deletedAt,
    );
  }
}
