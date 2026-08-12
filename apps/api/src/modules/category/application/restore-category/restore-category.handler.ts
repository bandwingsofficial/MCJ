import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { RestoreCategoryCommand } from './restore-category.command';
import { RestoreCategoryResult } from './restore-category.result';

export class RestoreCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: RestoreCategoryCommand,
  ): Promise<RestoreCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id, true),
    );

    await this.domainService.ensureCanRestore(
      this.categoryRepo,
      category,
    );

    const nextDisplayOrder =
      (await this.categoryRepo.getMaxDisplayOrder(null)) + 1;

    // Do not restore previous branch assignment after archive.
    category.update({
      displayOrder: nextDisplayOrder,
      branchId: null,
      updatedBy: command.updatedBy,
    });

    category.restore(command.updatedBy);

    await this.categoryRepo.save(category);

    return RestoreCategoryResult.fromEntity(category);
  }
}
