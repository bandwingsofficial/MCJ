import { InvalidMovePositionException } from '@common/exceptions/invalid-move-position.exception';

import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';

import { MoveFinancialArticleCommand } from './move-financial-article.command';

export class MoveFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly domainService: FinancialArticleDomainService,
  ) {}

  async execute(
    command: MoveFinancialArticleCommand,
  ): Promise<FinancialArticleAdminResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id),
    );

    const maxPosition = await this.articleRepo.getMaxDisplayOrder();

    if (
      !Number.isInteger(command.newPosition) ||
      command.newPosition < 1 ||
      command.newPosition > maxPosition
    ) {
      throw new InvalidMovePositionException(
        `Position must be between 1 and ${maxPosition}`,
      );
    }

    await this.articleRepo.move(
      article.id,
      article.displayOrder,
      command.newPosition,
      command.updatedBy,
    );

    const detail = await this.articleRepo.findDetailById(article.id);

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
