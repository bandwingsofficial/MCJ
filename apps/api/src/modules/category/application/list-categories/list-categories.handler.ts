import type { CategoryRepository } from '../../domain/repositories/category.repository';

import { ListCategoriesQuery } from './list-categories.query';
import { ListCategoriesResult } from './list-categories.result';

export class ListCategoriesHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    query: ListCategoriesQuery,
  ): Promise<ListCategoriesResult[]> {
    const categories = await this.categoryRepo.findAll({
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    });

    return categories.map(ListCategoriesResult.fromEntity);
  }
}
