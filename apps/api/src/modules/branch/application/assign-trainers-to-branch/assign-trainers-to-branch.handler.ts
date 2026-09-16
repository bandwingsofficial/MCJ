import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { TrainerStatus } from '@/modules/trainer/domain/enums/trainer-status.enum';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { AssignTrainersToBranchCommand } from './assign-trainers-to-branch.command';
import { AssignTrainersToBranchResult } from './assign-trainers-to-branch.result';

export class AssignTrainersToBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: AssignTrainersToBranchCommand,
  ): Promise<AssignTrainersToBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const uniqueIds = [...new Set(command.trainerIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Select at least one trainer to assign',
        400,
      );
    }

    const trainers = await this.branchRepo.findTrainersByIds(uniqueIds);
    const trainersById = new Map(trainers.map((trainer) => [trainer.id, trainer]));

    for (const trainerId of uniqueIds) {
      const trainer = trainersById.get(trainerId);

      if (!trainer || trainer.isDeleted) {
        throw new BaseException(
          ERROR_CODES.TRAINER_NOT_FOUND,
          'Trainer not found',
          404,
        );
      }

      if (trainer.status !== TrainerStatus.ACTIVE) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Only active trainers can be assigned to a branch',
          400,
        );
      }
    }

    const assignedCount = await this.branchRepo.assignTrainersToBranch(
      command.branchId,
      uniqueIds,
    );

    return new AssignTrainersToBranchResult(
      command.branchId,
      assignedCount,
      uniqueIds,
    );
  }
}
