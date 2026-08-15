import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Trainer } from '../../domain/entities/trainer.entity';
import type { TrainerRepository } from '../../domain/repositories/trainer.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkTrainerItemResult } from '../shared/bulk-trainer-operation.result';
import { parseBulkTrainerIds } from '../shared/parse-bulk-trainer-ids';

import { BulkDeleteTrainersCommand } from './bulk-delete-trainers.command';
import { BulkDeleteTrainersResult } from './bulk-delete-trainers.result';

export class BulkDeleteTrainersHandler {
  private readonly logger = new Logger(BulkDeleteTrainersHandler.name);

  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    command: BulkDeleteTrainersCommand,
  ): Promise<BulkDeleteTrainersResult> {
    try {
      this.logger.log('Bulk delete trainers request received');

      const trainerIds = parseBulkTrainerIds(command.trainerIds);
      const itemResults: BulkTrainerItemResult[] = [];
      const trainersToDelete: Trainer[] = [];

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
            success: true,
            message: 'Trainer is already archived',
          });
          continue;
        }

        trainersToDelete.push(trainer);
      }

      trainersToDelete.sort((left, right) => {
        const leftOrder = left.displayOrder ?? -1;
        const rightOrder = right.displayOrder ?? -1;
        return rightOrder - leftOrder;
      });

      for (const trainer of trainersToDelete) {
        try {
          const deletedDisplayOrder = trainer.displayOrder;

          trainer.softDelete();
          await this.trainerRepo.save(trainer);

          if (deletedDisplayOrder != null) {
            await this.trainerRepo.closeDisplayOrderGap(
              deletedDisplayOrder,
            );
          }

          itemResults.push({
            trainerId: trainer.id,
            success: true,
            message: 'Trainer archived successfully',
          });

          this.logger.log(`Trainer soft deleted: ${trainer.id}`);
        } catch {
          itemResults.push({
            trainerId: trainer.id,
            success: false,
            message: 'Unable to archive trainer',
          });
        }
      }

      return BulkDeleteTrainersResult.fromItemResults(
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
