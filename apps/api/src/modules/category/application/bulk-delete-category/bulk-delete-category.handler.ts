import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { BulkDeleteCategoryCommand } from './bulk-delete-category.command';
import { BulkDeleteCategoryResult } from './bulk-delete-category.result';

export class BulkDeleteCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: BulkDeleteCategoryCommand,
  ): Promise<BulkDeleteCategoryResult> {
    const results: {
      id: string;
      isDeleted: boolean;
      deletedAt: Date | null;
    }[] = [];

    for (const id of command.ids) {
      const category =
        await this.domainService.ensureExists(
          await this.categoryRepo.findById(id),
        );

      if (category.isDeleted) {
        results.push({
          id: category.id,
          isDeleted: true,
          deletedAt: category.deletedAt,
        });

        continue;
      }

      const deletedDisplayOrder =
        category.displayOrder;

      category.softDelete(command.deletedBy);

      await this.categoryRepo.save(category);

      if (deletedDisplayOrder !== null) {
        await this.categoryRepo.closeDisplayOrderGap(
          deletedDisplayOrder,
          category.branchId,
        );
      }

      results.push({
        id: category.id,
        isDeleted: true,
        deletedAt: category.deletedAt,
      });
    }

    return new BulkDeleteCategoryResult(results);
  }
}
