import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { DeleteFinancialArticleCommand } from './delete-financial-article.command';
import { DeleteFinancialArticleResult } from './delete-financial-article.result';

export class DeleteFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
  ) {}

  async execute(
    command: DeleteFinancialArticleCommand,
  ): Promise<DeleteFinancialArticleResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(article);

    const deletedDisplayOrder = article.displayOrder;

    article.softDelete(command.deletedBy);

    await this.articleRepo.save(article);

    await this.articleRepo.closeDisplayOrderGap(deletedDisplayOrder);

    return new DeleteFinancialArticleResult(
      article.id,
      true,
      article.deletedAt,
    );
  }
}
