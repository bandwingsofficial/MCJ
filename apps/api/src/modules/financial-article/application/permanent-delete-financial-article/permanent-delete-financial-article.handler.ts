import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { PermanentDeleteFinancialArticleCommand } from './permanent-delete-financial-article.command';
import { PermanentDeleteFinancialArticleResult } from './permanent-delete-financial-article.result';

export class PermanentDeleteFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteFinancialArticleCommand,
  ): Promise<PermanentDeleteFinancialArticleResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(article);

    const uploadIds = [
      article.thumbnailFileId,
      article.bannerFileId,
    ];

    await this.articleRepo.deletePermanent(article.id);

    await this.uploadDomainService.permanentDeleteMany(uploadIds);

    return new PermanentDeleteFinancialArticleResult(article.id, true);
  }
}
