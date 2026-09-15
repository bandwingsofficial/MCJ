import {
  FinancialArticleAdminResult,
  FinancialArticlePublicResult,
} from '../financial-article.result';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';

import { ListFinancialArticlesQuery } from './list-financial-articles.query';
import { ListFinancialArticlesResult } from './list-financial-articles.result';

export class ListFinancialArticlesHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
  ) {}

  async execute(
    query: ListFinancialArticlesQuery,
  ): Promise<
    | ListFinancialArticlesResult<FinancialArticleAdminResult>
    | ListFinancialArticlesResult<FinancialArticlePublicResult>
  > {
    const filters = {
      categoryId: query.categoryId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      isDeleted: query.isDeleted,
      isActive: query.isActive,
      skip: query.skip,
      take: query.take,
    };

    if (query.onlyPublished) {
      const articles = await this.articleRepo.findPublished(filters);
      const total = await this.articleRepo.count({
        ...filters,
        skip: undefined,
        take: undefined,
      });

      return new ListFinancialArticlesResult(
        FinancialArticlePublicResult.fromDetailList(articles),
        total,
      );
    }

    const [articles, total] = await Promise.all([
      this.articleRepo.findMany(filters),
      this.articleRepo.count({
        ...filters,
        skip: undefined,
        take: undefined,
      }),
    ]);

    return new ListFinancialArticlesResult(
      articles.map((article) =>
        FinancialArticleAdminResult.fromDetail(article),
      ),
      total,
    );
  }
}
