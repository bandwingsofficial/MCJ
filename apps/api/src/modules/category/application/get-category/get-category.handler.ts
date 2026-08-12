import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryStatus } from '../../domain/enums/category-status.enum';
import { CategoryDomainService } from '../../domain/services/category-domain.service';

import { GetCategoryQuery } from './get-category.query';
import { GetCategoryResult } from './get-category.result';

export class GetCategoryHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CategoryDomainService,
  ) {}

  async execute(
    query: GetCategoryQuery,
  ): Promise<GetCategoryResult> {
    const category = await this.domainService.ensureExists(
      await this.categoryRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    if (
      query.onlyActive &&
      category.status !== CategoryStatus.ACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_NOT_FOUND,
        'Category not found',
        404,
      );
    }

    return GetCategoryResult.fromEntity(category);
  }
}
