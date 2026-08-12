import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Category } from '../entities/category.entity';
import type { CategoryRepository } from '../repositories/category.repository';

@Injectable()
export class CategoryDomainService {
  async ensureExists(
    category: Category | null,
  ): Promise<Category> {
    if (!category) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_NOT_FOUND,
        'Category not found',
        404,
      );
    }

    return category;
  }

  async ensureSlugIsAvailable(
    categoryRepo: CategoryRepository,
    slug: string,
    branchId?: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existing = await categoryRepo.findBySlug(
      slug,
      branchId,
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        'Category slug already exists',
        400,
      );
    }
  }
}
