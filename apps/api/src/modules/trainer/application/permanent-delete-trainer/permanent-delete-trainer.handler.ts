import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';

import { PermanentDeleteTrainerCommand } from './permanent-delete-trainer.command';
import { PermanentDeleteTrainerResult } from './permanent-delete-trainer.result';

export class PermanentDeleteTrainerHandler {
  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: PermanentDeleteTrainerCommand,
  ): Promise<PermanentDeleteTrainerResult> {
    const trainer = await this.domainService.ensureExists(
      await this.trainerRepo.findById(command.id, true),
    );
    const profileImageFileId = trainer.profileImageFileId;

    await this.trainerRepo.deletePermanent(trainer.id);

    if (profileImageFileId) {
      await this.uploadDomainService.permanentDelete(
        profileImageFileId,
      );
    }

    return new PermanentDeleteTrainerResult(trainer.id, true);
  }
}
