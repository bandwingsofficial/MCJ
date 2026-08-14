import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';

import { formatCategoryBlockingMessage } from '../shared/format-category-blocking-message';
import type { BulkCategoryItemResult } from '../shared/bulk-category-operation.result';
import { parseBulkCategoryIds } from '../shared/parse-bulk-category-ids';

import { BulkPermanentDeleteCategoryCommand } from './bulk-permanent-delete-category.command';
import { BulkPermanentDeleteCategoriesResult } from './bulk-permanent-delete-category.result';

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

export class BulkPermanentDeleteCategoryHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteCategoryHandler.name,
  );

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: BulkPermanentDeleteCategoryCommand,
  ): Promise<BulkPermanentDeleteCategoriesResult> {
    this.logger.log(
      'Bulk permanent delete categories request received',
    );

    const categoryIds = parseBulkCategoryIds(command.categoryIds);
    const itemResults: BulkCategoryItemResult[] = [];

    for (const categoryId of categoryIds) {
      const category = await this.categoryRepo.findById(
        categoryId,
        true,
      );

      if (!category) {
        itemResults.push({
          categoryId,
          success: false,
          message: 'Category not found',
        });
        continue;
      }

      if (
        !category.isDeleted &&
        category.status !== CategoryStatus.ARCHIVED
      ) {
        itemResults.push({
          categoryId,
          success: false,
          message:
            'Only archived categories can be permanently deleted',
        });
        continue;
      }

      const refs = await this.categoryRepo.countBlockingReferences(
        category.id,
      );

      const blockingMessage = formatCategoryBlockingMessage({
        courses: refs.courses,
        enrollments: refs.enrollments,
        articles: refs.articles,
      });

      if (blockingMessage) {
        itemResults.push({
          categoryId,
          success: false,
          message: blockingMessage,
        });
        continue;
      }

      const displayOrder = category.displayOrder;
      const thumbnailFileId = category.thumbnailFileId;

      try {
        await this.categoryRepo.removeBranchAssignments(
          category.id,
        );
        await this.categoryRepo.deletePermanent(category.id);

        if (displayOrder != null) {
          await this.categoryRepo.closeDisplayOrderGap(
            displayOrder,
          );
        }

        if (thumbnailFileId) {
          try {
            await this.uploadDomainService.softDelete(
              thumbnailFileId,
            );
          } catch {
            // Category row is already removed.
          }
        }

        itemResults.push({
          categoryId,
          success: true,
          message: 'Category permanently deleted successfully',
        });
      } catch (error) {
        if (isForeignKeyRestrictError(error)) {
          itemResults.push({
            categoryId,
            success: false,
            message:
              'Cannot permanently delete this category because it is still referenced by other records. Reassign those records first.',
          });
          continue;
        }

        itemResults.push({
          categoryId,
          success: false,
          message: 'Unable to permanently delete category',
        });
      }
    }

    return BulkPermanentDeleteCategoriesResult.fromItemResults(
      categoryIds.length,
      itemResults,
    );
  }
}
