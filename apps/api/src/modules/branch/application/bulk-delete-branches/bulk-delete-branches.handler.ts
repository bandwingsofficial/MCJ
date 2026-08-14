import { Inject, Logger } from '@nestjs/common';

import { BulkDeleteBranchesCommand } from './bulk-delete-branches.command';
import { BulkDeleteBranchesResult } from './bulk-delete-branches.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchDomainService } from '../../domain/services/branch-domain.service';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class BulkDeleteBranchesHandler {
  private readonly logger = new Logger(
    BulkDeleteBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: BulkDeleteBranchesCommand,
  ): Promise<BulkDeleteBranchesResult> {
    try {
      this.logger.log(
        'Bulk delete branches request received',
      );

      if (
        !command.branchIds ||
        command.branchIds.length === 0
      ) {
        throw new ValidationError(
          'At least one branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const branchIds = [
        ...new Set(
          command.branchIds
            .map((id) => id?.trim())
            .filter(Boolean),
        ),
      ];

      if (branchIds.length === 0) {
        throw new ValidationError(
          'At least one valid branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      let deleted = 0;

      for (const branchId of branchIds) {
        const branch =
          await this.branchRepo.findById(branchId);

        this.domainService.ensureBranchExists(
          branch,
        );

        const deletedDisplayOrder =
          branch.displayOrder;

        branch.softDelete();

        await this.branchRepo.save(branch);

        if (deletedDisplayOrder != null) {
          await this.branchRepo.closeDisplayOrderGap(
            deletedDisplayOrder,
          );
        }

        deleted++;

        this.logger.log(
          `Branch soft deleted: ${branch.id}`,
        );
      }

      return new BulkDeleteBranchesResult(
        true,
        deleted,
        `${deleted} branch${
          deleted === 1 ? '' : 'es'
        } deleted successfully`,
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