import { Inject, Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBranchItemResult } from '../shared/bulk-branch-operation.result';
import { parseBulkBranchIds } from '../shared/parse-bulk-branch-ids';

import { BRANCH_TOKENS } from '../../branch.tokens';

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

      const branchIds = parseBulkBranchIds(command.branchIds);
      const itemResults: BulkBranchItemResult[] = [];

      for (const branchId of branchIds) {
        const branch =
          await this.branchRepo.findByIdIncludingDeleted(
            branchId,
          );

        if (!branch) {
          itemResults.push({
            branchId,
            success: false,
            message: 'Branch not found',
          });
          continue;
        }

        if (!branch.isDeleted()) {
          itemResults.push({
            branchId,
            success: false,
            message: 'Branch is already active',
          });
          continue;
        }

        try {
          const nextDisplayOrder =
            (await this.branchRepo.getMaxDisplayOrder()) + 1;

          branch.restore();
          branch.changeDisplayOrder(nextDisplayOrder);

          await this.branchRepo.save(branch);

          itemResults.push({
            branchId: branch.id,
            success: true,
            message: 'Branch restored successfully',
            status: branch.status,
          });

          this.logger.log(
            `Branch restored: ${branch.id}`,
          );
        } catch {
          itemResults.push({
            branchId,
            success: false,
            message: 'Unable to restore branch',
          });
        }
      }

      return BulkRestoreBranchesResult.fromItemResults(
        branchIds.length,
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
