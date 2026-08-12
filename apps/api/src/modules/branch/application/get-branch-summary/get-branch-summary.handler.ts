import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BRANCH_TOKENS } from '../../branch.tokens';

import { ValidationError } from '../errors/validation.error';

import { GetBranchSummaryQuery } from './get-branch-summary.query';
import { GetBranchSummaryResult } from './get-branch-summary.result';

export class GetBranchSummaryHandler {
  private readonly logger = new Logger(
    GetBranchSummaryHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    query: GetBranchSummaryQuery,
  ): Promise<GetBranchSummaryResult> {
    try {
      this.logger.log('Get branch summary request received');

      const branch =
        await this.branchRepo.findByIdIncludingDeleted(
          query.branchId,
        );

      this.domainService.ensureBranchExists(branch);

      const counts =
        await this.branchRepo.getManagementCounts(branch.id);

      return new GetBranchSummaryResult(
        branch.id,
        counts.students,
        counts.courses,
        counts.batches,
        counts.enrollments,
        counts.instructors,
        counts.categories,
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
