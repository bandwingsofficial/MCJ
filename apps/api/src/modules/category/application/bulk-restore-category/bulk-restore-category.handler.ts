import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { BulkRestoreCategoryCommand } from './bulk-restore-category.command';
import { BulkRestoreCategoryResult } from './bulk-restore-category.result';

export class BulkRestoreCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: BulkRestoreCategoryCommand,
  ): Promise<BulkRestoreCategoryResult> {
    const categories: Category[] = [];

    let displayOrder =
      await this.categoryRepo.getMaxDisplayOrder();

    for (const id of command.ids) {
      const category =
        await this.domainService.ensureExists(
          await this.categoryRepo.findById(id, true),
        );

      if (!category.isDeleted) {
        categories.push(category);
        continue;
      }

      displayOrder++;

      category.update({
        displayOrder,
        updatedBy: command.updatedBy,
      });

      category.restore(command.updatedBy);

      await this.categoryRepo.save(category);

      categories.push(category);
    }

    return BulkRestoreCategoryResult.fromEntities(
      categories,
    );
  }
}
