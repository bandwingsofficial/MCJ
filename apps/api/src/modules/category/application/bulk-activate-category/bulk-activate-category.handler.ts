import { CategoryStatus } from '../../domain/enums/category-status.enum';

import { BulkUpdateCategoryStatusCommand } from '../bulk-update-category-status/bulk-update-category-status.command';
import { BulkUpdateCategoryStatusHandler } from '../bulk-update-category-status/bulk-update-category-status.handler';
import { BulkUpdateCategoryStatusResult } from '../bulk-update-category-status/bulk-update-category-status.result';

import { BulkActivateCategoryCommand } from './bulk-activate-category.command';

export class BulkActivateCategoryHandler {
  constructor(
    private readonly bulkUpdateStatusHandler: BulkUpdateCategoryStatusHandler,
  ) {}

  async execute(
    command: BulkActivateCategoryCommand,
  ): Promise<BulkUpdateCategoryStatusResult> {
    return this.bulkUpdateStatusHandler.execute(
      new BulkUpdateCategoryStatusCommand(
        command.categoryIds,
        CategoryStatus.ACTIVE,
        command.updatedBy,
      ),
    );
  }
}
