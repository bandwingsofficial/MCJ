import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkTrainerItemResult } from '../shared/bulk-trainer-operation.result';
import { parseBulkTrainerIds } from '../shared/parse-bulk-trainer-ids';

import { BulkRestoreTrainersCommand } from './bulk-restore-trainers.command';
import { BulkRestoreTrainersResult } from './bulk-restore-trainers.result';

export class BulkRestoreTrainersHandler {
  private readonly logger = new Logger(BulkRestoreTrainersHandler.name);

  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    command: BulkRestoreTrainersCommand,
  ): Promise<BulkRestoreTrainersResult> {
    try {
      this.logger.log('Bulk restore trainers request received');

      const trainerIds = parseBulkTrainerIds(command.trainerIds);
      const itemResults: BulkTrainerItemResult[] = [];

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

        if (!trainer.isDeleted) {
          itemResults.push({
            trainerId,
            success: false,
            message: 'Trainer is already active',
          });
          continue;
        }

        try {
          const nextDisplayOrder =
            (await this.trainerRepo.getMaxDisplayOrder()) + 1;

          trainer.restore();
          trainer.changeDisplayOrder(nextDisplayOrder);

          await this.trainerRepo.save(trainer);

          itemResults.push({
            trainerId: trainer.id,
            success: true,
            message: 'Trainer restored successfully',
            status: trainer.status,
          });

          this.logger.log(`Trainer restored: ${trainer.id}`);
        } catch {
          itemResults.push({
            trainerId,
            success: false,
            message: 'Unable to restore trainer',
          });
        }
      }

      return BulkRestoreTrainersResult.fromItemResults(
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
