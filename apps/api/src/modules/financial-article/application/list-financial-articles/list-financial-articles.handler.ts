import {
  FinancialArticleAdminResult,
  FinancialArticlePublicResult,
} from '../financial-article.result';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';

import { ListFinancialArticlesQuery } from './list-financial-articles.query';

export class ListFinancialArticlesHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
  ) {}

  async execute(
    query: ListFinancialArticlesQuery,
  ): Promise<
    FinancialArticleAdminResult[] | FinancialArticlePublicResult[]
  > {
    const filters = {
      categoryId: query.categoryId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    };

    if (query.onlyPublished) {
      const articles = await this.articleRepo.findPublished(filters);
      return FinancialArticlePublicResult.fromDetailList(articles);
    }

    const articles = await this.articleRepo.findMany(filters);

    return articles.map((article) =>
      FinancialArticleAdminResult.fromDetail(article),
    );
  }
}
