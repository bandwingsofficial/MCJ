import { CategoryStatus } from '../../domain/enums/category-status.enum';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { UpdateCategoryStatusCommand } from './update-category-status.command';
import { UpdateCategoryStatusResult } from './update-category-status.result';

export class UpdateCategoryStatusHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: UpdateCategoryStatusCommand,
  ): Promise<UpdateCategoryStatusResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.id),
    );

    // Prevent re-activating an already active category
    if (
      command.activate &&
      category.status === CategoryStatus.ACTIVE
    ) {
      return UpdateCategoryStatusResult.fromEntity(
        category,
      );
    }

    // Prevent re-deactivating an already inactive category
    if (
      !command.activate &&
      category.status === CategoryStatus.INACTIVE
    ) {
      return UpdateCategoryStatusResult.fromEntity(
        category,
      );
    }

    if (command.activate) {
      const nextDisplayOrder =
        (await this.categoryRepo.getMaxActiveDisplayOrder(
          category.branchId,
        )) + 1;

      category.update({
        displayOrder: nextDisplayOrder,
        updatedBy: command.updatedBy,
      });

      category.activate(command.updatedBy);
    } else {
      if (category.displayOrder !== null) {
        await this.categoryRepo.closeDisplayOrderGap(
          category.displayOrder,
          category.branchId,
        );
      }

      category.update({
        displayOrder: null,
        updatedBy: command.updatedBy,
      });

      category.deactivate(command.updatedBy);
    }

    await this.categoryRepo.save(category);

    return UpdateCategoryStatusResult.fromEntity(
      category,
    );
  }
}