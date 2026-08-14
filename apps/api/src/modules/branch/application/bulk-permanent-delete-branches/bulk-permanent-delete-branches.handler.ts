import { Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BRANCH_TOKENS } from '../../branch.tokens';

import { ValidationError } from '../errors/validation.error';
import { formatBranchBlockingMessage } from '../shared/format-branch-blocking-message';
import type { BulkBranchItemResult } from '../shared/bulk-branch-operation.result';
import { parseBulkBranchIds } from '../shared/parse-bulk-branch-ids';

import { BulkPermanentDeleteBranchesCommand } from './bulk-permanent-delete-branches.command';
import { BulkPermanentDeleteBranchesResult } from './bulk-permanent-delete-branches.result';

function isForeignKeyRestrictError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('foreign key constraint') ||
    message.includes('violates restrict') ||
    message.includes('23001') ||
    message.includes('23503')
  );
}

export class BulkPermanentDeleteBranchesHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteBranchesHandler.name,
  );

  constructor(
    @Inject(BRANCH_TOKENS.BRANCH_REPOSITORY)
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: BulkPermanentDeleteBranchesCommand,
  ): Promise<BulkPermanentDeleteBranchesResult> {
    try {
      this.logger.log(
        'Bulk permanent delete branches request received',
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
            message:
              'Only archived branches can be permanently deleted',
          });
          continue;
        }

        const refs =
          await this.branchRepo.countBlockingReferences(
            branch.id,
          );

        const blockingMessage =
          formatBranchBlockingMessage(refs);

        if (blockingMessage) {
          itemResults.push({
            branchId,
            success: false,
            message: blockingMessage,
          });
          continue;
        }

        const displayOrder = branch.displayOrder;

        try {
          await this.branchRepo.deletePermanent(branch.id);

          if (displayOrder != null) {
            await this.branchRepo.closeDisplayOrderGap(
              displayOrder,
            );
          }

          itemResults.push({
            branchId,
            success: true,
            message: 'Branch permanently deleted successfully',
          });

          this.logger.log(
            `Branch permanently deleted: ${branch.id}`,
          );
        } catch (error) {
          if (isForeignKeyRestrictError(error)) {
            itemResults.push({
              branchId,
              success: false,
              message:
                'Cannot permanently delete this branch because it is still referenced by other records.',
            });
            continue;
          }

          itemResults.push({
            branchId,
            success: false,
            message: 'Unable to permanently delete branch',
          });
        }
      }

      return BulkPermanentDeleteBranchesResult.fromItemResults(
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
