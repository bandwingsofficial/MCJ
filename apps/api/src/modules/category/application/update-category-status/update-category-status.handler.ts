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
      // Do not restore previous branch assignment on reactivation.
      const nextDisplayOrder =
        (await this.categoryRepo.getMaxActiveDisplayOrder(
          null,
        )) + 1;

      category.update({
        displayOrder: nextDisplayOrder,
        branchId: null,
        updatedBy: command.updatedBy,
      });

      category.activate(command.updatedBy);
    } else {
      const previousBranchId = category.branchId;

      if (category.displayOrder !== null) {
        await this.categoryRepo.closeDisplayOrderGap(
          category.displayOrder,
          previousBranchId,
        );
      }

      // Clear branch assignment so inactive categories leave Branch Management.
      category.update({
        displayOrder: null,
        branchId: null,
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
