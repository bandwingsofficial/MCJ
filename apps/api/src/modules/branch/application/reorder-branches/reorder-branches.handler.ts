import { Inject, Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BranchStatus } from '../../domain/enums/branch-status.enum';
import { BRANCH_TOKENS } from '../../branch.tokens';

import { ValidationError } from '../errors/validation.error';

import { ReorderBranchesCommand } from './reorder-branches.command';
import { ReorderBranchesResult } from './reorder-branches.result';

export class ReorderBranchesHandler {
  private readonly logger = new Logger(
    ReorderBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: ReorderBranchesCommand,
  ): Promise<ReorderBranchesResult> {
    try {
      this.logger.log('Reorder branch request received');

      const branch = await this.branchRepo.findById(
        command.branchId,
      );

      this.domainService.ensureBranchExists(branch);

      if (
        branch.isDeleted() ||
        branch.status !== BranchStatus.ACTIVE ||
        branch.displayOrder == null
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Deleted, inactive, or unordered branches cannot be reordered',
          400,
        );
      }

      if (command.newDisplayOrder < 1) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order must be at least 1',
          400,
        );
      }

      const maxOrder =
        await this.branchRepo.getMaxDisplayOrder();

      if (command.newDisplayOrder > maxOrder) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order is out of range',
          400,
        );
      }

      if (branch.displayOrder === command.newDisplayOrder) {
        return new ReorderBranchesResult(
          branch.id,
          branch.displayOrder,
        );
      }

      await this.branchRepo.moveDisplayOrder(
        branch.id,
        branch.displayOrder,
        command.newDisplayOrder,
      );

      return new ReorderBranchesResult(
        branch.id,
        command.newDisplayOrder,
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
