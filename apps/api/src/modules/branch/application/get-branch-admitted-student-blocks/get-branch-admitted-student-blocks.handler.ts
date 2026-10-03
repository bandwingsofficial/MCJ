import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BRANCH_TOKENS } from '../../branch.tokens';

import { ValidationError } from '../errors/validation.error';
import { parseBulkBranchIds } from '../shared/parse-bulk-branch-ids';

import { GetBranchAdmittedStudentBlocksQuery } from './get-branch-admitted-student-blocks.query';
import { GetBranchAdmittedStudentBlocksResult } from './get-branch-admitted-student-blocks.result';

export class GetBranchAdmittedStudentBlocksHandler {
  private readonly logger = new Logger(
    GetBranchAdmittedStudentBlocksHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    query: GetBranchAdmittedStudentBlocksQuery,
  ): Promise<GetBranchAdmittedStudentBlocksResult> {
    try {
      this.logger.log(
        'Get branch admitted student blocks request received',
      );

      const branchIds = parseBulkBranchIds(query.branchIds);

      const blocks =
        await this.branchRepo.findAdmittedStudentBlocksByBranchIds(
          branchIds,
        );

      return new GetBranchAdmittedStudentBlocksResult(blocks);
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
