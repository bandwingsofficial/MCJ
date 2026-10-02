import { Logger } from '@nestjs/common';

import type { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';

import { formatCategoryArchiveBlockingMessage } from '../shared/format-category-deactivate-blocking-message';
import type { BulkCategoryItemResult } from '../shared/bulk-category-operation.result';
import { parseBulkCategoryIds } from '../shared/parse-bulk-category-ids';

import { BulkDeleteCategoryCommand } from './bulk-delete-category.command';
import { BulkDeleteCategoriesResult } from './bulk-delete-category.result';

export class BulkDeleteCategoryHandler {
  private readonly logger = new Logger(
    BulkDeleteCategoryHandler.name,
  );

  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    command: BulkDeleteCategoryCommand,
  ): Promise<BulkDeleteCategoriesResult> {
    this.logger.log('Bulk delete categories request received');

    const categoryIds = parseBulkCategoryIds(command.categoryIds);
    const itemResults: BulkCategoryItemResult[] = [];
    const categoriesToDelete: Category[] = [];

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

      if (category.isDeleted) {
        itemResults.push({
          categoryId,
          success: true,
          message: 'Category is already archived',
        });
        continue;
      }

      categoriesToDelete.push(category);
    }

    categoriesToDelete.sort((left, right) => {
      const leftOrder = left.displayOrder ?? -1;
      const rightOrder = right.displayOrder ?? -1;
      return rightOrder - leftOrder;
    });

    const archiveCourseBlockers: {
      categoryId: string;
      blockingCourseNames: string[];
      courseCount: number;
    }[] = [];

    for (const category of categoriesToDelete) {
      const refs = await this.categoryRepo.countBlockingReferences(
        category.id,
      );

      if (refs.courses > 0) {
        const blockingCourseNames =
          await this.categoryRepo.findBlockingCourseNames(category.id);

        archiveCourseBlockers.push({
          categoryId: category.id,
          blockingCourseNames,
          courseCount: refs.courses,
        });
      }
    }

    if (archiveCourseBlockers.length > 0) {
      for (const category of categoriesToDelete) {
        const blocker = archiveCourseBlockers.find(
          (entry) => entry.categoryId === category.id,
        );

        itemResults.push({
          categoryId: category.id,
          success: false,
          message: blocker
            ? formatCategoryArchiveBlockingMessage(
                blocker.blockingCourseNames,
                blocker.courseCount,
              )
            : 'Archive cancelled because other selected categories are used by courses.',
        });
      }

      return BulkDeleteCategoriesResult.fromItemResults(
        categoryIds.length,
        itemResults,
      );
    }

    for (const category of categoriesToDelete) {
      try {
        const deletedDisplayOrder = category.displayOrder;

        await this.categoryRepo.removeBranchAssignments(
          category.id,
        );

        category.update({
          displayOrder: null,
          updatedBy: command.deletedBy,
        });
        category.softDelete(command.deletedBy);
        await this.categoryRepo.save(category);

        if (deletedDisplayOrder !== null) {
          await this.categoryRepo.closeDisplayOrderGap(
            deletedDisplayOrder,
          );
        }

        itemResults.push({
          categoryId: category.id,
          success: true,
          message: 'Category archived successfully',
        });
      } catch {
        itemResults.push({
          categoryId: category.id,
          success: false,
          message: 'Unable to archive category',
        });
      }
    }

    await this.categoryRepo.normalizeOrderedDisplayOrders();

    return BulkDeleteCategoriesResult.fromItemResults(
      categoryIds.length,
      itemResults,
    );
  }
}
