import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { TrainerRepository } from '../../domain/repositories/trainer.repository';
import { TrainerDomainService } from '../../domain/services/trainer-domain.service';
import { TrainerStatus } from '../../domain/enums/trainer-status.enum';

import { ValidationError } from '../errors/validation.error';

import { ReorderTrainersCommand } from './reorder-trainers.command';
import { ReorderTrainersResult } from './reorder-trainers.result';

export class ReorderTrainersHandler {
  private readonly logger = new Logger(ReorderTrainersHandler.name);

  constructor(
    private readonly trainerRepo: TrainerRepository,
    private readonly domainService: TrainerDomainService,
  ) {}

  async execute(
    command: ReorderTrainersCommand,
  ): Promise<ReorderTrainersResult> {
    try {
      this.logger.log('Reorder trainer request received');

      const trainer = await this.domainService.ensureExists(
        await this.trainerRepo.findById(command.trainerId),
      );

      if (
        trainer.isDeleted ||
        trainer.status !== TrainerStatus.ACTIVE ||
        trainer.displayOrder == null
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Deleted, inactive, or unordered trainers cannot be reordered',
          400,
        );
      }

      if (command.newDisplayOrder < 1) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order must be at least 1',
          400,
        );
      }

      const maxOrder = await this.trainerRepo.getMaxDisplayOrder();

      if (command.newDisplayOrder > maxOrder) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order is out of range',
          400,
        );
      }

      if (trainer.displayOrder === command.newDisplayOrder) {
        return new ReorderTrainersResult(
          trainer.id,
          trainer.displayOrder,
        );
      }

      await this.trainerRepo.moveDisplayOrder(
        trainer.id,
        trainer.displayOrder,
        command.newDisplayOrder,
      );

      return new ReorderTrainersResult(
        trainer.id,
        command.newDisplayOrder,
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
