import { Inject, Logger } from '@nestjs/common';

import { BRANCH_TOKENS } from '../../branch.tokens';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';

import { BulkRestoreBranchesCommand } from './bulk-restore-branches.command';
import { BulkRestoreBranchesResult } from './bulk-restore-branches.result';

export class BulkRestoreBranchesHandler {
  private readonly logger = new Logger(
    BulkRestoreBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: BulkRestoreBranchesCommand,
  ): Promise<BulkRestoreBranchesResult> {
    try {
      this.logger.log(
        'Bulk restore branches request received',
      );

      if (
        !command.ids ||
        command.ids.length === 0
      ) {
        throw new ValidationError(
          'At least one branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const branchIds = [
        ...new Set(
          command.ids
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

      let restored = 0;

      for (const id of branchIds) {
        const branch =
          await this.branchRepo.findByIdIncludingDeleted(
            id,
          );

        if (!branch) {
          throw new BranchNotFoundException(id);
        }

        if (!branch.isDeleted()) {
          throw new ValidationError(
            `Branch ${id} is already active`,
          );
        }

        const nextDisplayOrder =
          (await this.branchRepo.getMaxDisplayOrder()) + 1;

        branch.restore();
        branch.changeDisplayOrder(
          nextDisplayOrder,
        );

        await this.branchRepo.save(branch);

        restored++;

        this.logger.log(
          `Branch restored: ${branch.id}`,
        );
      }

      return new BulkRestoreBranchesResult(
        true,
        restored,
        `${restored} branch${
          restored === 1 ? '' : 'es'
        } restored successfully`,
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