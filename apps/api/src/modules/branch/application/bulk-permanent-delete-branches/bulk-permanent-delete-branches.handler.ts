import { Inject, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { BranchRepository } from '../../domain/repositories/branch.repository';
import { BranchDomainService } from '../../domain/services/branch-domain.service';
import { BRANCH_TOKENS } from '../../branch.tokens';

import { ValidationError } from '../errors/validation.error';

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

    private readonly domainService: BranchDomainService,
  ) {}

  async execute(
    command: BulkPermanentDeleteBranchesCommand,
  ): Promise<BulkPermanentDeleteBranchesResult> {
    try {
      this.logger.log(
        'Bulk permanent delete branches request received',
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

      let permanentlyDeleted = 0;

      for (const branchId of branchIds) {
        const branch =
          await this.branchRepo.findByIdIncludingDeleted(
            branchId,
          );

        this.domainService.ensureBranchExists(branch);

        if (!branch.isDeleted()) {
          throw new BaseException(
            ERROR_CODES.VALIDATION_ERROR,
            'Only archived branches can be permanently deleted',
            400,
          );
        }

        const refs =
          await this.branchRepo.countBlockingReferences(
            branch.id,
          );

        const blockingParts: string[] = [];

        if (refs.branchUsers > 0) {
          blockingParts.push(
            `${refs.branchUsers} branch user${
              refs.branchUsers === 1 ? '' : 's'
            }`,
          );
        }

        if (refs.students > 0) {
          blockingParts.push(
            `${refs.students} student${
              refs.students === 1 ? '' : 's'
            }`,
          );
        }

        if (refs.trainers > 0) {
          blockingParts.push(
            `${refs.trainers} trainer${
              refs.trainers === 1 ? '' : 's'
            }`,
          );
        }

        if (refs.enrollments > 0) {
          blockingParts.push(
            `${refs.enrollments} enrollment${
              refs.enrollments === 1 ? '' : 's'
            }`,
          );
        }

        if (refs.batches > 0) {
          blockingParts.push(
            `${refs.batches} batch${
              refs.batches === 1 ? '' : 'es'
            }`,
          );
        }

        if (refs.categories > 0) {
          blockingParts.push(
            `${refs.categories} categor${
              refs.categories === 1 ? 'y' : 'ies'
            }`,
          );
        }

        if (refs.courseBranches > 0) {
          blockingParts.push(
            `${refs.courseBranches} course link${
              refs.courseBranches === 1 ? '' : 's'
            }`,
          );
        }

        if (blockingParts.length > 0) {
          throw new BaseException(
            ERROR_CODES.VALIDATION_ERROR,
            `Cannot permanently delete this branch because it is still linked to ${blockingParts.join(
              ', ',
            )}. Reassign or remove those records first.`,
            409,
          );
        }

        const displayOrder = branch.displayOrder;

        try {
          await this.branchRepo.deletePermanent(
            branch.id,
          );
        } catch (error) {
          if (isForeignKeyRestrictError(error)) {
            throw new BaseException(
              ERROR_CODES.VALIDATION_ERROR,
              'Cannot permanently delete this branch because it is still referenced by other records.',
              409,
            );
          }

          throw error;
        }

        if (displayOrder != null) {
          await this.branchRepo.closeDisplayOrderGap(
            displayOrder,
          );
        }

        permanentlyDeleted++;

        this.logger.log(
          `Branch permanently deleted: ${branch.id}`,
        );
      }

      return new BulkPermanentDeleteBranchesResult(
        true,
        permanentlyDeleted,
        `${permanentlyDeleted} branch${
          permanentlyDeleted === 1 ? '' : 'es'
        } permanently deleted successfully`,
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