import { FinancialArticlePublicResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { GetFinancialArticleBySlugQuery } from './get-financial-article-by-slug.query';

export class GetFinancialArticleBySlugHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
  ) {}

  async execute(
    query: GetFinancialArticleBySlugQuery,
  ): Promise<FinancialArticlePublicResult> {
    const detail = await this.articleRepo.findDetailBySlug(query.slug);

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    if (query.onlyPublic) {
      const article = this.domainService.ensureExists(
        await this.articleRepo.findBySlug(query.slug),
      );
      this.domainService.ensurePubliclyVisible(article);
    }

    const relatedArticles = await this.articleRepo.findRelatedArticles(
      detail.categoryId,
      detail.id,
    );

    return FinancialArticlePublicResult.fromDetail(
      detail,
      relatedArticles,
    );
  }
}
