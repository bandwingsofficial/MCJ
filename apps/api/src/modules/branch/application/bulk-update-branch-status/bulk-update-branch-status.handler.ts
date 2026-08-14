import { Inject, Logger } from '@nestjs/common';

import { BulkUpdateBranchStatusCommand } from './bulk-update-branch-status.command';
import { BulkUpdateBranchStatusResult } from './bulk-update-branch-status.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class BulkUpdateBranchStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateBranchStatusHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: BulkUpdateBranchStatusCommand,
  ): Promise<BulkUpdateBranchStatusResult> {
    try {
      this.logger.log(
        'Bulk update branch status request received',
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

      if (!command.status) {
        throw new ValidationError(
          'Branch status is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      if (
        command.status !== BranchStatus.ACTIVE &&
        command.status !== BranchStatus.INACTIVE
      ) {
        throw new ValidationError(
          'Only ACTIVE and INACTIVE statuses are supported',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      let updated = 0;

      for (const branchId of branchIds) {
        const branch =
          await this.branchRepo.findById(branchId);

        this.domainService.ensureBranchExists(branch);

        if (command.status === branch.status) {
          continue;
        }

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

        updated++;

        this.logger.log(
          `Branch status updated: ${branch.id}`,
        );
      }

      return new BulkUpdateBranchStatusResult(
        updated,
        command.status,
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