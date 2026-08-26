import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { countWords } from '@common/utils/word-count.util';

import type { Category } from '../entities/category.entity';
import type { CategoryRepository } from '../repositories/category.repository';
import { CategoryName } from '../value-objects/category-name.vo';

export const CATEGORY_DESCRIPTION_MAX_WORDS = 100;

@Injectable()
export class CategoryDomainService {
  normalizeDescription(
    description?: string | null,
  ): string | null {
    const trimmed = description?.trim() ?? '';

    if (!trimmed) {
      return null;
    }

    const words = countWords(trimmed);

    if (words > CATEGORY_DESCRIPTION_MAX_WORDS) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_WORDS} words`,
        400,
        {
          errors: {
            description: [
              `Description cannot exceed ${CATEGORY_DESCRIPTION_MAX_WORDS} words`,
            ],
          },
        },
      );
    }

    return trimmed;
  }

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
    excludeId?: string,
  ): Promise<void> {
    const existing = await categoryRepo.findBySlug(
      slug,
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        'Category already exists.',
        409,
      );
    }
  }

  async ensureNameIsAvailable(
    categoryRepo: CategoryRepository,
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await categoryRepo.findByNameInsensitive(
      CategoryName.normalize(name),
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        'Category already exists.',
        409,
      );
    }
  }

  async ensureCanRestore(
    categoryRepo: CategoryRepository,
    category: Category,
  ): Promise<void> {
    const nameOwner = await categoryRepo.findByNameInsensitive(
      category.name.getValue(),
      true,
    );

    if (nameOwner && nameOwner.id !== category.id) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        'Cannot restore category because another category already uses this name.',
        409,
      );
    }

    const slugOwner = await categoryRepo.findBySlug(
      category.slug.getValue(),
      true,
    );

    if (slugOwner && slugOwner.id !== category.id) {
      throw new BaseException(
        ERROR_CODES.CATEGORY_ALREADY_EXISTS,
        'Cannot restore category because another category already uses this slug.',
        409,
      );
    }
  }
}
