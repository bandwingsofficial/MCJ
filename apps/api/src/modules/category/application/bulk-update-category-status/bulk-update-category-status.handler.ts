import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import type { BulkCategoryItemResult } from '../shared/bulk-category-operation.result';
import { parseBulkCategoryIds } from '../shared/parse-bulk-category-ids';

import { BulkUpdateCategoryStatusCommand } from './bulk-update-category-status.command';
import { BulkUpdateCategoryStatusResult } from './bulk-update-category-status.result';

export class BulkUpdateCategoryStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateCategoryStatusHandler.name,
  );

  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    command: BulkUpdateCategoryStatusCommand,
  ): Promise<BulkUpdateCategoryStatusResult> {
    this.logger.log('Bulk update category status request received');

    const categoryIds = parseBulkCategoryIds(command.categoryIds);

    if (
      command.status !== CategoryStatus.ACTIVE &&
      command.status !== CategoryStatus.INACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Only ACTIVE and INACTIVE statuses are supported',
        400,
      );
    }

    const itemResults: BulkCategoryItemResult[] = [];
    const categoriesToDeactivate: Category[] = [];

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
          success: false,
          message:
            'Archived categories cannot be activated or deactivated',
        });
        continue;
      }

      if (command.status === category.status) {
        itemResults.push({
          categoryId,
          success: true,
          message: `Category is already ${command.status.toLowerCase()}`,
          status: category.status,
        });
        continue;
      }

      if (command.status === CategoryStatus.ACTIVE) {
        try {
          const nextDisplayOrder =
            (await this.categoryRepo.getMaxActiveDisplayOrder()) +
            1;

          category.update({
            displayOrder: nextDisplayOrder,
            updatedBy: command.updatedBy,
          });
          category.activate(command.updatedBy);
          await this.categoryRepo.save(category);

          itemResults.push({
            categoryId,
            success: true,
            message: 'Category activated successfully',
            status: category.status,
          });
        } catch {
          itemResults.push({
            categoryId,
            success: false,
            message: 'Unable to activate category',
          });
        }

        continue;
      }

      categoriesToDeactivate.push(category);
    }

    categoriesToDeactivate.sort((left, right) => {
      const leftOrder = left.displayOrder ?? -1;
      const rightOrder = right.displayOrder ?? -1;
      return rightOrder - leftOrder;
    });

    for (const category of categoriesToDeactivate) {
      try {
        if (category.displayOrder !== null) {
          await this.categoryRepo.closeDisplayOrderGap(
            category.displayOrder,
          );
        }

        await this.categoryRepo.removeBranchAssignments(
          category.id,
        );

        category.update({
          displayOrder: null,
          updatedBy: command.updatedBy,
        });
        category.deactivate(command.updatedBy);
        await this.categoryRepo.save(category);

        itemResults.push({
          categoryId: category.id,
          success: true,
          message: 'Category deactivated successfully',
          status: category.status,
        });
      } catch {
        itemResults.push({
          categoryId: category.id,
          success: false,
          message: 'Unable to deactivate category',
        });
      }
    }

    if (command.status === CategoryStatus.INACTIVE) {
      await this.categoryRepo.normalizeOrderedDisplayOrders();
    }

    return BulkUpdateCategoryStatusResult.create(
      command.status,
      categoryIds.length,
      itemResults,
    );
  }
}
