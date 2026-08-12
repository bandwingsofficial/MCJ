import { Inject, Logger } from '@nestjs/common';

import { BRANCH_TOKENS } from '../../branch.tokens';

import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { BaseException } from '@common/exceptions/base.exception';

import { ValidationError } from '../errors/validation.error';

import { RestoreBranchCommand } from './restore-branch.command';
import { RestoreBranchResult } from './restore-branch.result';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';

export class RestoreBranchHandler {
  private readonly logger = new Logger(
    RestoreBranchHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: RestoreBranchCommand,
  ): Promise<RestoreBranchResult> {
    try {
      this.logger.log(
        `♻️ Restore branch request received: ${command.id}`,
      );

      // =====================
      // 1️⃣ FIND BRANCH
      // =====================

      const branch =
        await this.branchRepo.findByIdIncludingDeleted(
          command.id,
        );

      if (!branch) {
        throw new BranchNotFoundException(
          command.id,
        );
      }

      // =====================
      // 2️⃣ VALIDATE
      // =====================

      if (!branch.isDeleted()) {
        throw new ValidationError(
          'Branch is already active',
        );
      }

      // =====================
      // 3️⃣ RESTORE
      // =====================

      branch.restore();

      // =====================
      // 4️⃣ SAVE
      // =====================

      await this.branchRepo.save(branch);

      this.logger.log(
        `✅ Branch restored: ${branch.id}`,
      );

      // =====================
      // 5️⃣ RESPONSE
      // =====================

      return new RestoreBranchResult(
        branch.id,

        branch.branchName.getValue(),

        branch.branchCode.getValue(),

        branch.status,

        branch.description,

        branch.createdAt,

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

