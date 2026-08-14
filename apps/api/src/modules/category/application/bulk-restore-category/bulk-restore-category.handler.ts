import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import type { BulkCategoryItemResult } from '../shared/bulk-category-operation.result';
import { parseBulkCategoryIds } from '../shared/parse-bulk-category-ids';

import { BulkRestoreCategoryCommand } from './bulk-restore-category.command';
import { BulkRestoreCategoriesResult } from './bulk-restore-category.result';

export class BulkRestoreCategoryHandler {
  private readonly logger = new Logger(
    BulkRestoreCategoryHandler.name,
  );

  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: BulkRestoreCategoryCommand,
  ): Promise<BulkRestoreCategoriesResult> {
    this.logger.log('Bulk restore categories request received');

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

      if (!category.isDeleted) {
        itemResults.push({
          categoryId,
          success: false,
          message: 'Category is already active',
        });
        continue;
      }

      try {
        await this.domainService.ensureCanRestore(
          this.categoryRepo,
          category,
        );

        const nextDisplayOrder =
          (await this.categoryRepo.getMaxDisplayOrder()) + 1;

        category.update({
          displayOrder: nextDisplayOrder,
          updatedBy: command.updatedBy,
        });
        category.restore(command.updatedBy);
        await this.categoryRepo.save(category);

        itemResults.push({
          categoryId,
          success: true,
          message: 'Category restored successfully',
          status: category.status,
        });
      } catch (error) {
        const message =
          error instanceof BaseException
            ? error.message
            : 'Unable to restore category';

        itemResults.push({
          categoryId,
          success: false,
          message,
        });
      }
    }

    await this.categoryRepo.normalizeOrderedDisplayOrders();

    return BulkRestoreCategoriesResult.fromItemResults(
      categoryIds.length,
      itemResults,
    );
  }
}
