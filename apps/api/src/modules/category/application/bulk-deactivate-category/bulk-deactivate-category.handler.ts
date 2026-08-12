import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { BulkDeactivateCategoryCommand } from './bulk-deactivate-category.command';
import { BulkDeactivateCategoryResult } from './bulk-deactivate-category.result';

export class BulkDeactivateCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: BulkDeactivateCategoryCommand,
  ): Promise<BulkDeactivateCategoryResult> {
    const categories: Category[] = [];

    for (const id of command.ids) {
      const category = await this.domainService.ensureExists(
        await this.categoryRepo.findById(id),
      );

      // Skip already inactive categories
      if (category.status === CategoryStatus.INACTIVE) {
        categories.push(category);
        continue;
      }

      const previousBranchId = category.branchId;

      if (category.displayOrder !== null) {
        await this.categoryRepo.closeDisplayOrderGap(
          category.displayOrder,
          previousBranchId,
        );
      }

      category.update({
        displayOrder: null,
        branchId: null,
        updatedBy: command.updatedBy,
      });

      category.deactivate(command.updatedBy);

      await this.categoryRepo.save(category);

      categories.push(category);
    }

    return BulkDeactivateCategoryResult.fromEntities(
      categories,
    );
  }
}