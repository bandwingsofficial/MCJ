import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { RestoreFinancialArticleCommand } from './restore-financial-article.command';

export class RestoreFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
  ) {}

  async execute(
    command: RestoreFinancialArticleCommand,
  ): Promise<FinancialArticleAdminResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(article);

    const nextDisplayOrder =
      (await this.articleRepo.getMaxDisplayOrder()) + 1;

    article.moveTo(nextDisplayOrder, command.updatedBy);
    article.restore(command.updatedBy);

    await this.articleRepo.save(article);

    const detail = await this.articleRepo.findDetailById(
      article.id,
      true,
    );

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
