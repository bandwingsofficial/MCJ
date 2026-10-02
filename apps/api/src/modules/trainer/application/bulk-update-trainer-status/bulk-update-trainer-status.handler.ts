import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Trainer } from '../../domain/entities/trainer.entity';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';

import { ValidationError } from '../errors/validation.error';
import type { BulkTrainerItemResult } from '../shared/bulk-trainer-operation.result';
import { parseBulkTrainerIds } from '../shared/parse-bulk-trainer-ids';

import { formatTrainerBranchBlockingMessage } from '../shared/format-trainer-branch-blocking-message';

import { BulkUpdateTrainerStatusCommand } from './bulk-update-trainer-status.command';
import { BulkUpdateTrainerStatusResult } from './bulk-update-trainer-status.result';

export class BulkUpdateTrainerStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateTrainerStatusHandler.name,
  );

  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    command: BulkUpdateTrainerStatusCommand,
  ): Promise<BulkUpdateTrainerStatusResult> {
    try {
      this.logger.log('Bulk update trainer status request received');

      const trainerIds = parseBulkTrainerIds(command.trainerIds);

      if (
        command.status !== TrainerStatus.ACTIVE &&
        command.status !== TrainerStatus.INACTIVE
      ) {
        throw new ValidationError(
          'Only ACTIVE and INACTIVE statuses are supported',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const itemResults: BulkTrainerItemResult[] = [];
      const trainersToUpdate: Trainer[] = [];

      for (const trainerId of trainerIds) {
        const trainer =
          await this.trainerRepo.findByIdIncludingDeleted(trainerId);

        if (!trainer) {
          itemResults.push({
            trainerId,
            success: false,
            message: 'Trainer not found',
          });
          continue;
        }

        if (trainer.isDeleted) {
          itemResults.push({
            trainerId,
            success: false,
            message:
              'Archived trainers cannot be activated or deactivated',
          });
          continue;
        }

        if (command.status === trainer.status) {
          itemResults.push({
            trainerId,
            success: true,
            message: `Trainer is already ${command.status.toLowerCase()}`,
            status: trainer.status,
          });
          continue;
        }

        trainersToUpdate.push(trainer);
      }

      if (command.status === TrainerStatus.INACTIVE) {
        trainersToUpdate.sort((left, right) => {
          const leftOrder = left.displayOrder ?? -1;
          const rightOrder = right.displayOrder ?? -1;
          return rightOrder - leftOrder;
        });
      }

      const trainersToDeactivate =
        command.status === TrainerStatus.INACTIVE
          ? trainersToUpdate
          : [];

      const deactivateBranchBlockers: {
        trainerId: string;
        branchNames: string[];
        branchCount: number;
      }[] = [];

      for (const trainer of trainersToDeactivate) {
        const branchCount =
          await this.trainerRepo.countBranchAssignments(trainer.id);

        if (branchCount > 0) {
          const branchNames =
            await this.trainerRepo.findBranchAssignmentNames(trainer.id);

          deactivateBranchBlockers.push({
            trainerId: trainer.id,
            branchNames,
            branchCount,
          });
        }
      }

      if (deactivateBranchBlockers.length > 0) {
        for (const trainer of trainersToDeactivate) {
          const blocker = deactivateBranchBlockers.find(
            (entry) => entry.trainerId === trainer.id,
          );

          itemResults.push({
            trainerId: trainer.id,
            success: false,
            message: blocker
              ? formatTrainerBranchBlockingMessage(
                  blocker.branchNames,
                  blocker.branchCount,
                  'deactivate',
                )
              : 'Deactivation cancelled because other selected trainers are assigned to branches.',
          });
        }

        return BulkUpdateTrainerStatusResult.create(
          command.status,
          trainerIds.length,
          itemResults,
        );
      }

      for (const trainer of trainersToUpdate) {
        try {
          if (command.status === TrainerStatus.ACTIVE) {
            const nextDisplayOrder =
              (await this.trainerRepo.getMaxActiveDisplayOrder()) + 1;

            trainer.changeDisplayOrder(nextDisplayOrder);
            trainer.activate();
          } else {
            if (trainer.displayOrder != null) {
              await this.trainerRepo.closeDisplayOrderGap(
                trainer.displayOrder,
              );
            }

            trainer.changeDisplayOrder(null);
            trainer.deactivate();
          }

          await this.trainerRepo.save(trainer);

          itemResults.push({
            trainerId: trainer.id,
            success: true,
            message:
              command.status === TrainerStatus.ACTIVE
                ? 'Trainer activated successfully'
                : 'Trainer deactivated successfully',
            status: trainer.status,
          });

          this.logger.log(`Trainer status updated: ${trainer.id}`);
        } catch {
          itemResults.push({
            trainerId: trainer.id,
            success: false,
            message: 'Unable to update trainer status',
          });
        }
      }

      return BulkUpdateTrainerStatusResult.create(
        command.status,
        trainerIds.length,
        itemResults,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
