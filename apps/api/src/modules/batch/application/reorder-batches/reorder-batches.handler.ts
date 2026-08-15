import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';

import { ValidationError } from '../errors/validation.error';

import { ReorderBatchesCommand } from './reorder-batches.command';
import { ReorderBatchesResult } from './reorder-batches.result';

export class ReorderBatchesHandler {
  private readonly logger = new Logger(ReorderBatchesHandler.name);

  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    command: ReorderBatchesCommand,
  ): Promise<ReorderBatchesResult> {
    try {
      this.logger.log('Reorder batch request received');

      const batch = await this.batchRepo.findById(command.batchId);

      await this.domainService.ensureExists(batch);

      if (
        !batch ||
        batch.isDeleted ||
        !batch.isActive ||
        batch.displayOrder == null
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Deleted, inactive, or unordered batches cannot be reordered',
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

      const maxOrder = await this.batchRepo.getMaxDisplayOrder();

      if (command.newDisplayOrder > maxOrder) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order is out of range',
          400,
        );
      }

      if (batch.displayOrder === command.newDisplayOrder) {
        return new ReorderBatchesResult(
          batch.id,
          batch.displayOrder,
        );
      }

      await this.batchRepo.moveDisplayOrder(
        batch.id,
        batch.displayOrder,
        command.newDisplayOrder,
      );

      return new ReorderBatchesResult(
        batch.id,
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
