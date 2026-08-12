import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';

import { GetFinancialArticleQuery } from './get-financial-article.query';

export class GetFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
  ) {}

  async execute(
    query: GetFinancialArticleQuery,
  ): Promise<FinancialArticleAdminResult> {
    const detail = await this.articleRepo.findDetailById(
      query.id,
      query.includeDeleted,
    );

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
