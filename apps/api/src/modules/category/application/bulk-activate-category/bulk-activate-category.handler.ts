import { Category } from '../../domain/entities/category.entity';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { BulkActivateCategoryCommand } from './bulk-activate-category.command';
import { BulkActivateCategoryResult } from './bulk-activate-category.result';

export class BulkActivateCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: BulkActivateCategoryCommand,
  ): Promise<BulkActivateCategoryResult> {
    const categories: Category[] = [];

    let displayOrder =
      await this.categoryRepo.getMaxActiveDisplayOrder();

    for (const id of command.ids) {
      const category = await this.domainService.ensureExists(
        await this.categoryRepo.findById(id),
      );

      // Skip already active categories
      if (category.status === CategoryStatus.ACTIVE) {
        categories.push(category);
        continue;
      }

      displayOrder++;

      category.update({
        displayOrder,
        updatedBy: command.updatedBy,
      });

      category.activate(command.updatedBy);

      await this.categoryRepo.save(category);

      categories.push(category);
    }

    return BulkActivateCategoryResult.fromEntities(
      categories,
    );
  }
}