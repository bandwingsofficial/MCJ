import { Slug } from '../../domain/value-objects/slug.vo';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { CategoryName } from '../../domain/value-objects/category-name.vo';

import { CheckCategoryAvailabilityQuery } from './check-category-availability.query';
import { CheckCategoryAvailabilityResult } from './check-category-availability.result';

export class CheckCategoryAvailabilityHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    query: CheckCategoryAvailabilityQuery,
  ): Promise<CheckCategoryAvailabilityResult> {
    let nameAvailable: boolean | null = null;
    let nameMessage: string | null = null;
    let slugAvailable: boolean | null = null;
    let slugMessage: string | null = null;

    if (query.name?.trim()) {
      const existing =
        await this.categoryRepo.findByNameInsensitive(
          CategoryName.normalize(query.name),
          true,
        );

      nameAvailable =
        !existing || existing.id === query.excludeId;
      nameMessage = nameAvailable
        ? null
        : 'Category name already exists.';
    }

    if (query.slug?.trim()) {
      try {
        const normalized = Slug.create(query.slug).getValue();
        const existing = await this.categoryRepo.findBySlug(
          normalized,
          true,
        );

        slugAvailable =
          !existing || existing.id === query.excludeId;
        slugMessage = slugAvailable
          ? null
          : 'Category slug already exists.';
      } catch (error) {
        slugAvailable = false;
        slugMessage =
          error instanceof Error
            ? error.message
            : 'Invalid slug format';
      }
    }

    return new CheckCategoryAvailabilityResult(
      nameAvailable,
      slugAvailable,
      nameMessage,
      slugMessage,
    );
  }
}
