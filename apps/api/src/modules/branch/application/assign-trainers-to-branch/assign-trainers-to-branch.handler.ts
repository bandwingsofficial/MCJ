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

    let assignedCount = 0;

    if (command.assignmentType === 'COURSE_BATCH') {
      if (
        !command.courseId ||
        !command.batchId ||
        !command.mode ||
        !command.batchTimingId
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Course, batch, learning mode, and batch timing are required',
          400,
        );
      }

      try {
        assignedCount = await this.branchRepo.assignCourseBatchTrainersToBranch(
          command.branchId,
          uniqueIds,
          {
            courseId: command.courseId,
            batchId: command.batchId,
            mode: command.mode,
            batchTimingId: command.batchTimingId,
          },
        );
      } catch (error) {
        this.throwMappedContextError(error);
      }
    } else {
      assignedCount = await this.branchRepo.assignTrainersToBranch(
        command.branchId,
        uniqueIds,
      );
    }

    return new AssignTrainersToBranchResult(
      command.branchId,
      assignedCount,
      uniqueIds,
    );
  }

  private throwMappedContextError(error: unknown): never {
    if (!(error instanceof Error)) {
      throw error;
    }

    const messages: Record<string, string> = {
      BRANCH_COURSE_NOT_LINKED:
        'The selected course is not assigned to this branch',
      BRANCH_BATCH_NOT_LINKED:
        'The selected batch is not assigned to this branch',
      BATCH_NOT_FOUND: 'Batch not found',
      BATCH_NOT_UPCOMING: 'Only upcoming batches can be used for trainer assignment',
      BATCH_COURSE_MISMATCH: 'The selected batch does not belong to this course',
      BATCH_TIMING_NOT_FOUND: 'Batch timing not found',
      BATCH_TIMING_NOT_UPCOMING:
        'Only upcoming batch timings can be used for trainer assignment',
      BATCH_TIMING_MODE_MISMATCH:
        'The selected timing does not match the learning mode',
    };

    const message = messages[error.message];

    if (message) {
      throw new BaseException(ERROR_CODES.VALIDATION_ERROR, message, 400);
    }

    throw error;
  }
}
