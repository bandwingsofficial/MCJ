import { Inject, Logger } from '@nestjs/common';

import { DeleteBranchCommand } from './delete-branch.command';
import { DeleteBranchResult } from './delete-branch.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchDomainService } from '../../domain/services/branch-domain.service';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class DeleteBranchHandler {
  private readonly logger = new Logger(
    DeleteBranchHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: DeleteBranchCommand,
  ): Promise<DeleteBranchResult> {
    try {
      this.logger.log('Delete branch request received');

      if (!command.branchId?.trim()) {
        throw new ValidationError(
          'Branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const branch =
        await this.branchRepo.findById(
          command.branchId,
        );

      this.domainService.ensureBranchExists(
        branch,
      );

      const deletedDisplayOrder = branch.displayOrder;

      branch.softDelete();
      await this.branchRepo.save(branch);

      if (deletedDisplayOrder != null) {
        await this.branchRepo.closeDisplayOrderGap(
          deletedDisplayOrder,
        );
      }

      this.logger.log(
        `Branch soft deleted: ${branch.id}`,
      );

      return new DeleteBranchResult(
        true,
        'Branch deleted successfully',
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
