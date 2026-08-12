import type { CategoryRepository } from '../../domain/repositories/category.repository';

import { ListCategoriesQuery } from './list-categories.query';
import { ListCategoriesResult } from './list-categories.result';

export class ListCategoriesPageResult {
  constructor(
    public readonly items: ListCategoriesResult[],
    public readonly total: number,
    public readonly skip: number,
    public readonly take: number | null,
  ) {}
}

export class ListCategoriesHandler {
  constructor(
    private readonly categoryRepo: CategoryRepository,
  ) {}

  async execute(
    query: ListCategoriesQuery,
  ): Promise<ListCategoriesPageResult> {
    const filters = {
      branchId: query.branchId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      skip: query.skip,
      take: query.take,
    };

    const [categories, total] = await Promise.all([
      this.categoryRepo.findAll(filters),
      this.categoryRepo.count({
        branchId: filters.branchId,
        status: filters.status,
        search: filters.search,
        includeDeleted: filters.includeDeleted,
        onlyActive: filters.onlyActive,
      }),
    ]);

    return new ListCategoriesPageResult(
      categories.map(ListCategoriesResult.fromEntity),
      total,
      query.skip ?? 0,
      query.take ?? null,
    );
  }
}
