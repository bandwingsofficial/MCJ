import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { formatTrainerBranchBlockingMessage } from '../shared/format-trainer-branch-blocking-message';

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
            'deactivate',
          ),
          409,
        );
      }

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
