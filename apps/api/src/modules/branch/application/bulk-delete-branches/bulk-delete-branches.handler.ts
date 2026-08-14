import { Inject, Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Branch } from '../../domain/entities/branch.entity';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkBranchItemResult } from '../shared/bulk-branch-operation.result';
import { parseBulkBranchIds } from '../shared/parse-bulk-branch-ids';

import { BRANCH_TOKENS } from '../../branch.tokens';

import { BulkDeleteBranchesCommand } from './bulk-delete-branches.command';
import { BulkDeleteBranchesResult } from './bulk-delete-branches.result';

export class BulkDeleteBranchesHandler {
  private readonly logger = new Logger(
    BulkDeleteBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: BulkDeleteBranchesCommand,
  ): Promise<BulkDeleteBranchesResult> {
    try {
      this.logger.log(
        'Bulk delete branches request received',
      );

      const branchIds = parseBulkBranchIds(command.branchIds);
      const itemResults: BulkBranchItemResult[] = [];
      const branchesToDelete: Branch[] = [];

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

        if (branch.isDeleted()) {
          itemResults.push({
            branchId,
            success: true,
            message: 'Branch is already archived',
          });
          continue;
        }

        branchesToDelete.push(branch);
      }

      branchesToDelete.sort((left, right) => {
        const leftOrder = left.displayOrder ?? -1;
        const rightOrder = right.displayOrder ?? -1;
        return rightOrder - leftOrder;
      });

      for (const branch of branchesToDelete) {
        try {
          const deletedDisplayOrder = branch.displayOrder;

          branch.softDelete();
          await this.branchRepo.save(branch);

          if (deletedDisplayOrder != null) {
            await this.branchRepo.closeDisplayOrderGap(
              deletedDisplayOrder,
            );
          }

          itemResults.push({
            branchId: branch.id,
            success: true,
            message: 'Branch archived successfully',
          });

          this.logger.log(
            `Branch soft deleted: ${branch.id}`,
          );
        } catch {
          itemResults.push({
            branchId: branch.id,
            success: false,
            message: 'Unable to archive branch',
          });
        }
      }

      return BulkDeleteBranchesResult.fromItemResults(
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
