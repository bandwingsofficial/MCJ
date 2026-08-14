import { CategoryStatus } from '../../domain/enums/category-status.enum';

import { BulkUpdateCategoryStatusCommand } from '../bulk-update-category-status/bulk-update-category-status.command';
import { BulkUpdateCategoryStatusHandler } from '../bulk-update-category-status/bulk-update-category-status.handler';
import { BulkUpdateCategoryStatusResult } from '../bulk-update-category-status/bulk-update-category-status.result';

import { BulkDeactivateCategoryCommand } from './bulk-deactivate-category.command';

export class BulkDeactivateCategoryHandler {
  constructor(
    private readonly bulkUpdateStatusHandler: BulkUpdateCategoryStatusHandler,
  ) {}

  async execute(
    command: BulkDeactivateCategoryCommand,
  ): Promise<BulkUpdateCategoryStatusResult> {
    return this.bulkUpdateStatusHandler.execute(
      new BulkUpdateCategoryStatusCommand(
        command.categoryIds,
        CategoryStatus.INACTIVE,
        command.updatedBy,
      ),
    );
  }
}
