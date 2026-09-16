import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { UnassignTrainerFromBranchCommand } from './unassign-trainer-from-branch.command';
import { UnassignTrainerFromBranchResult } from './unassign-trainer-from-branch.result';

export class UnassignTrainerFromBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: UnassignTrainerFromBranchCommand,
  ): Promise<UnassignTrainerFromBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const [trainer] = await this.branchRepo.findTrainersByIds([
      command.trainerId,
    ]);

    if (!trainer) {
      throw new BaseException(
        ERROR_CODES.TRAINER_NOT_FOUND,
        'Trainer not found',
        404,
      );
    }

    await this.branchRepo.unassignTrainerFromBranch(
      command.branchId,
      command.trainerId,
    );

    return new UnassignTrainerFromBranchResult(
      command.branchId,
      command.trainerId,
      true,
    );
  }
}
