import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { DeleteCategoryCommand } from './delete-category.command';
import { DeleteCategoryResult } from './delete-category.result';

export class DeleteCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: DeleteCategoryCommand,
  ): Promise<DeleteCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id),
    );

    const deletedDisplayOrder = category.displayOrder;
    const previousBranchId = category.branchId;

    // Clear branch assignment before soft-delete/archive.
    if (previousBranchId != null) {
      category.update({
        branchId: null,
        displayOrder: null,
        updatedBy: command.deletedBy,
      });
    }

    category.softDelete(command.deletedBy);

    await this.categoryRepo.save(category);

    if (deletedDisplayOrder != null) {
      await this.categoryRepo.closeDisplayOrderGap(
        deletedDisplayOrder,
        previousBranchId,
      );
    }

    return new DeleteCategoryResult(
      category.id,
      true,
      category.deletedAt,
    );
  }
}
