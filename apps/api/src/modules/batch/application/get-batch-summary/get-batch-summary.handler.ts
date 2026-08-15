import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BatchRepository } from '../../domain/repositories/batch.repository';
import { BatchDomainService } from '../../domain/services/batch-domain.service';

import { ValidationError } from '../errors/validation.error';

import { GetBatchSummaryQuery } from './get-batch-summary.query';
import { GetBatchSummaryResult } from './get-batch-summary.result';

export class GetBatchSummaryHandler {
  private readonly logger = new Logger(GetBatchSummaryHandler.name);

  constructor(
    private readonly batchRepo: BatchRepository,
    private readonly domainService: BatchDomainService,
  ) {}

  async execute(
    query: GetBatchSummaryQuery,
  ): Promise<GetBatchSummaryResult> {
    try {
      this.logger.log('Get batch summary request received');

      const batch = await this.batchRepo.findByIdIncludingDeleted(
        query.batchId,
      );

      await this.domainService.ensureExists(batch);

      const counts = await this.batchRepo.getSummaryCounts(query.batchId);

      return new GetBatchSummaryResult(
        query.batchId,
        counts.studentsCount,
        counts.trainerCount,
        counts.enrolledCount,
        counts.capacity,
        counts.attendancePresent,
        counts.attendanceAbsent,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code ?? ERROR_CODES.VALIDATION_ERROR,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
