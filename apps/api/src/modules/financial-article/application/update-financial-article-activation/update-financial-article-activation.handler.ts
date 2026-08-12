import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { UpdateFinancialArticleActivationCommand } from './update-financial-article-activation.command';

export class UpdateFinancialArticleActivationHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
  ) {}

  async execute(
    command: UpdateFinancialArticleActivationCommand,
  ): Promise<FinancialArticleAdminResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(article);

    if (command.activate) {
      article.activate(command.updatedBy);
    } else {
      article.deactivate(command.updatedBy);
    }

    await this.articleRepo.save(article);

    const detail = await this.articleRepo.findDetailById(article.id);

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
