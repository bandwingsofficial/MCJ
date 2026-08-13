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

function formatBlockingMessage(refs: {
  courses: number;
  enrollments: number;
  articles: number;
}): string {
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

  return `Cannot permanently delete this category because it is still referenced by ${parts.join(', ')}. Reassign those records to another category first.`;
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

    // Re-check immediately before delete (race-safe).
    const refs = await this.categoryRepo.countBlockingReferences(
      category.id,
    );

    // Required FKs: Course / Enrollment / FinancialArticle.categoryId
    const blockingCount =
      refs.courses + refs.enrollments + refs.articles;

    if (blockingCount > 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        formatBlockingMessage(refs),
        409,
      );
    }

    // BranchCategory rows are removable; required FKs already blocked above.
    await this.categoryRepo.removeBranchAssignments(
      category.id,
    );

    const thumbnailFileId = category.thumbnailFileId;

    try {
      await this.categoryRepo.deletePermanent(command.id);
    } catch (error) {
      if (isForeignKeyRestrictError(error)) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Cannot permanently delete this category because it is still referenced by other records. Reassign those records first.',
          409,
        );
      }

      throw error;
    }

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
