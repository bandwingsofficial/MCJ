import { Inject, Logger } from '@nestjs/common';

import { UpdateBranchStatusCommand } from './update-branch-status.command';
import { UpdateBranchStatusResult } from './update-branch-status.result';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BranchStatus } from '../../domain/enums/branch-status.enum';

import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import { ValidationError } from '../errors/validation.error';

import { BRANCH_TOKENS } from '../../branch.tokens';

export class UpdateBranchStatusHandler {
  private readonly logger = new Logger(
    UpdateBranchStatusHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: UpdateBranchStatusCommand,
  ): Promise<UpdateBranchStatusResult> {
    try {
      this.logger.log(
        'Update branch status request received',
      );

      if (!command.branchId?.trim()) {
        throw new ValidationError(
          'Branch id is required',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      if (!command.status) {
        throw new ValidationError(
          'Branch status is required',
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

      if (command.status === branch.status) {
        return new UpdateBranchStatusResult(
          branch.id,
          branch.branchName.getValue(),
          branch.branchCode.getValue(),
          branch.status,
          branch.updatedAt,
        );
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

      this.logger.log(
        `Branch status updated: ${branch.id}`,
      );

      return new UpdateBranchStatusResult(
        branch.id,
        branch.branchName.getValue(),
        branch.branchCode.getValue(),
        branch.status,
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
