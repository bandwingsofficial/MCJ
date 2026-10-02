import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { formatTrainerBranchBlockingMessage } from '../shared/format-trainer-branch-blocking-message';

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

    const branchCount =
      await this.trainerRepo.countBranchAssignments(trainer.id);

    if (branchCount > 0) {
      const branchNames =
        await this.trainerRepo.findBranchAssignmentNames(
          trainer.id,
        );

      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        formatTrainerBranchBlockingMessage(
          branchNames,
          branchCount,
          'delete',
        ),
        409,
      );
    }

    const deletedDisplayOrder = trainer.displayOrder;

    trainer.softDelete(command.deletedBy);
    await this.trainerRepo.save(trainer);

    if (deletedDisplayOrder != null) {
      await this.trainerRepo.closeDisplayOrderGap(
        deletedDisplayOrder,
      );
    }

    return new DeleteTrainerResult(
      trainer.id,
      true,
      trainer.deletedAt,
    );
  }
}
