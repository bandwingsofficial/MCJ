import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { ReorderCategoriesCommand } from './reorder-categories.command';
import { ReorderCategoriesResult } from './reorder-categories.result';

export class ReorderCategoriesHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    command: ReorderCategoriesCommand,
  ): Promise<ReorderCategoriesResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(command.categoryId),
    );

    if (
      category.isDeleted ||
      category.displayOrder == null
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Archived or unordered categories cannot be reordered',
        400,
      );
    }

    if (command.newDisplayOrder < 1) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Display order must be at least 1',
        400,
      );
    }

    const maxOrder = await this.categoryRepo.getMaxDisplayOrder();

    if (command.newDisplayOrder > maxOrder) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Display order is out of range',
        400,
      );
    }

    if (category.displayOrder === command.newDisplayOrder) {
      return new ReorderCategoriesResult(
        category.id,
        category.displayOrder,
      );
    }

    await this.categoryRepo.moveDisplayOrder(
      category.id,
      category.displayOrder,
      command.newDisplayOrder,
    );

    await this.categoryRepo.normalizeOrderedDisplayOrders();

    return new ReorderCategoriesResult(
      category.id,
      command.newDisplayOrder,
    );
  }
}
