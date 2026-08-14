import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Branch } from '../../domain/entities/branch.entity';
import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { ValidationError } from '../errors/validation.error';
import type { BulkBranchItemResult } from '../shared/bulk-branch-operation.result';
import { parseBulkBranchIds } from '../shared/parse-bulk-branch-ids';

import { BRANCH_TOKENS } from '../../branch.tokens';

import { BulkUpdateBranchStatusCommand } from './bulk-update-branch-status.command';
import { BulkUpdateBranchStatusResult } from './bulk-update-branch-status.result';

export class BulkUpdateBranchStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateBranchStatusHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: BulkUpdateBranchStatusCommand,
  ): Promise<BulkUpdateBranchStatusResult> {
    try {
      this.logger.log(
        'Bulk update branch status request received',
      );

      const branchIds = parseBulkBranchIds(command.branchIds);

      if (
        command.status !== BranchStatus.ACTIVE &&
        command.status !== BranchStatus.INACTIVE
      ) {
        throw new ValidationError(
          'Only ACTIVE and INACTIVE statuses are supported',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const itemResults: BulkBranchItemResult[] = [];

      const branchesToUpdate: Branch[] = [];

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
            success: false,
            message:
              'Archived branches cannot be activated or deactivated',
          });
          continue;
        }

        if (command.status === branch.status) {
          itemResults.push({
            branchId,
            success: true,
            message: `Branch is already ${command.status.toLowerCase()}`,
            status: branch.status,
          });
          continue;
        }

        branchesToUpdate.push(branch);
      }

      if (command.status === BranchStatus.INACTIVE) {
        branchesToUpdate.sort((left, right) => {
          const leftOrder = left.displayOrder ?? -1;
          const rightOrder = right.displayOrder ?? -1;
          return rightOrder - leftOrder;
        });
      }

      for (const branch of branchesToUpdate) {
        try {
          if (command.status === BranchStatus.ACTIVE) {
            const nextDisplayOrder =
              (await this.branchRepo.getMaxActiveDisplayOrder()) +
              1;

            branch.changeDisplayOrder(nextDisplayOrder);
            branch.activate();
          } else {
            if (branch.displayOrder != null) {
              await this.branchRepo.closeDisplayOrderGap(
                branch.displayOrder,
              );
            }

            branch.changeDisplayOrder(null);
            branch.changeStatus(command.status);
          }

          await this.branchRepo.save(branch);

          itemResults.push({
            branchId: branch.id,
            success: true,
            message:
              command.status === BranchStatus.ACTIVE
                ? 'Branch activated successfully'
                : 'Branch deactivated successfully',
            status: branch.status,
          });

          this.logger.log(
            `Branch status updated: ${branch.id}`,
          );
        } catch {
          itemResults.push({
            branchId: branch.id,
            success: false,
            message: 'Unable to update branch status',
          });
        }
      }

      return BulkUpdateBranchStatusResult.create(
        command.status,
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
