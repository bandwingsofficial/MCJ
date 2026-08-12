import { Inject, Logger } from '@nestjs/common';

import { GetBranchQuery } from './get-branch.query';
import { GetBranchResult } from './get-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchDomainService } from '../../domain/services/branch-domain.service';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class GetBranchHandler {
  private readonly logger = new Logger(
    GetBranchHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    query: GetBranchQuery,
  ): Promise<GetBranchResult> {
    try {
      this.logger.log('Get branch request received');

      if (!query.branchId?.trim()) {
        throw new ValidationError(
          'Branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const branch =
        await this.branchRepo.findByIdIncludingDeleted(
          query.branchId,
        );

      this.domainService.ensureBranchExists(
        branch,
      );

      return new GetBranchResult(
        branch.id,
        branch.branchName.getValue(),
        branch.branchCode.getValue(),
        branch.email?.getValue() ?? null,
        branch.phone?.getValue() ?? null,
        branch.addressLine1,
        branch.addressLine2,
        branch.city,
        branch.state,
        branch.country,
        branch.postalCode,
        branch.latitude,
        branch.longitude,
        branch.status,
        branch.description,
        branch.deletedAt,
        branch.createdAt,
        branch.updatedAt,
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
