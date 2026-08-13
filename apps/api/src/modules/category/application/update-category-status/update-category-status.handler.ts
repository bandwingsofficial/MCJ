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

    if (
      command.activate &&
      category.status === CategoryStatus.ACTIVE
    ) {
      return UpdateCategoryStatusResult.fromEntity(
        category,
      );
    }

    if (
      !command.activate &&
      category.status === CategoryStatus.INACTIVE
    ) {
      return UpdateCategoryStatusResult.fromEntity(
        category,
      );
    }

    if (command.activate) {
      // Do not restore previous branch assignments on reactivation.
      const nextDisplayOrder =
        (await this.categoryRepo.getMaxActiveDisplayOrder()) +
        1;

      category.update({
        displayOrder: nextDisplayOrder,
        updatedBy: command.updatedBy,
      });

      category.activate(command.updatedBy);
    } else {
      if (category.displayOrder !== null) {
        await this.categoryRepo.closeDisplayOrderGap(
          category.displayOrder,
        );
      }

      // Clear all BranchCategory rows so inactive categories leave Branch Management.
      await this.categoryRepo.removeBranchAssignments(
        category.id,
      );

      category.update({
        displayOrder: null,
        updatedBy: command.updatedBy,
      });

      category.deactivate(command.updatedBy);
    }

    await this.categoryRepo.save(category);
    await this.categoryRepo.normalizeOrderedDisplayOrders();

    return UpdateCategoryStatusResult.fromEntity(
      category,
    );
  }
}
