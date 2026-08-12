import { Prisma } from '@prisma/client';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { PermanentDeleteCategoryCommand } from './permanent-delete-category.command';
import { PermanentDeleteCategoryResult } from './permanent-delete-category.result';

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

export class PermanentDeleteCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCategoryCommand,
  ): Promise<PermanentDeleteCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id, true),
    );

    if (
      !category.isDeleted &&
      category.status !== CategoryStatus.ARCHIVED
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only archived categories can be permanently deleted',
        400,
      );
    }

    const refs = await this.categoryRepo.countBlockingReferences(
      category.id,
    );
    const blockingCount =
      refs.courses + refs.enrollments + refs.articles;

    if (blockingCount > 0) {
      const parts: string[] = [];
      if (refs.courses > 0) {
        parts.push(
          `${refs.courses} course${refs.courses === 1 ? '' : 's'}`,
        );
      }
      if (refs.enrollments > 0) {
        parts.push(
          `${refs.enrollments} enrollment${refs.enrollments === 1 ? '' : 's'}`,
        );
      }
      if (refs.articles > 0) {
        parts.push(
          `${refs.articles} article${refs.articles === 1 ? '' : 's'}`,
        );
      }

      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `Cannot permanently delete this category because it is still linked to ${parts.join(', ')}. Reassign or remove those records first.`,
        409,
      );
    }

    const thumbnailFileId = category.thumbnailFileId;
    const displayOrder = category.displayOrder;

    try {
      await this.categoryRepo.deletePermanent(command.id);
    } catch (error) {
      if (isForeignKeyRestrictError(error)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Cannot permanently delete this category because it is still referenced by other records.',
          409,
        );
      }

      throw error;
    }

    if (displayOrder != null) {
      await this.categoryRepo.closeDisplayOrderGap(
        displayOrder,
        category.branchId,
      );
    }

    // Soft-delete thumbnail after category removal so S3 failures
    // do not turn a successful category delete into a 500 response.
    if (thumbnailFileId) {
      try {
        await this.uploadDomainService.softDelete(thumbnailFileId);
      } catch {
        // Category row is already removed; ignore upload cleanup failure.
      }
    }

    return new PermanentDeleteCategoryResult(
      category.id,
      true,
    );
  }
}
