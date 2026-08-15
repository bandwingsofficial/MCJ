import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkTrainerItemResult } from '../shared/bulk-trainer-operation.result';
import { parseBulkTrainerIds } from '../shared/parse-bulk-trainer-ids';

import { BulkPermanentDeleteTrainersCommand } from './bulk-permanent-delete-trainers.command';
import { BulkPermanentDeleteTrainersResult } from './bulk-permanent-delete-trainers.result';

function isForeignKeyRestrictError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('foreign key constraint') ||
    message.includes('violates restrict') ||
    message.includes('23001') ||
    message.includes('23503')
  );
}

export class BulkPermanentDeleteTrainersHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteTrainersHandler.name,
  );

  constructor(
    private readonly trainerRepo: TrainerRepository,
  ) {}

  async execute(
    command: BulkPermanentDeleteTrainersCommand,
  ): Promise<BulkPermanentDeleteTrainersResult> {
    try {
      this.logger.log('Bulk permanent delete trainers request received');

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
            message:
              'Only archived trainers can be permanently deleted',
          });
          continue;
        }

        const displayOrder = trainer.displayOrder;

        try {
          await this.trainerRepo.deletePermanent(trainer.id);

          if (displayOrder != null) {
            await this.trainerRepo.closeDisplayOrderGap(displayOrder);
          }

          itemResults.push({
            trainerId,
            success: true,
            message: 'Trainer permanently deleted successfully',
          });

          this.logger.log(`Trainer permanently deleted: ${trainer.id}`);
        } catch (error) {
          if (isForeignKeyRestrictError(error)) {
            itemResults.push({
              trainerId,
              success: false,
              message:
                'Cannot permanently delete this trainer because it is still referenced by other records.',
            });
            continue;
          }

          itemResults.push({
            trainerId,
            success: false,
            message: 'Unable to permanently delete trainer',
          });
        }
      }

      return BulkPermanentDeleteTrainersResult.fromItemResults(
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
