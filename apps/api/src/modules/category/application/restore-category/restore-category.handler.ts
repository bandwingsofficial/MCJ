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
      (await this.categoryRepo.getMaxDisplayOrder()) + 1;

    // Do not restore previous branch assignments after archive.
    category.update({
      displayOrder: nextDisplayOrder,
      updatedBy: command.updatedBy,
    });

    category.restore(command.updatedBy);

    await this.categoryRepo.save(category);
    await this.categoryRepo.normalizeOrderedDisplayOrders();

    return RestoreCategoryResult.fromEntity(category);
  }
}
