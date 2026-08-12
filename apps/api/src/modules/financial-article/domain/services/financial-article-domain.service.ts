import { Injectable } from '@nestjs/common';

import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { CategoryNotFoundException } from '@modules/course/domain/errors/category-not-found.exception';

import { FinancialArticle } from '../entities/financial-article.entity';
import {
  FinancialArticleAlreadyExistsException,
  FinancialArticleDeletedException,
  FinancialArticleInactiveException,
  FinancialArticleNotDeletedException,
  FinancialArticleNotFoundException,
} from '../errors/financial-article-business.exception';
import { FinancialArticleStatus } from '../enums/financial-article-status.enum';
import type { FinancialArticleRepository } from '../repositories/financial-article.repository';

@Injectable()
export class FinancialArticleDomainService {
  ensureExists(
    article: FinancialArticle | null,
  ): FinancialArticle {
    if (!article) {
      throw new FinancialArticleNotFoundException();
    }

    return article;
  }

  ensureNotDeleted(article: FinancialArticle): void {
    if (article.isDeleted) {
      throw new FinancialArticleDeletedException();
    }
  }

  ensureDeleted(article: FinancialArticle): void {
    if (!article.isDeleted) {
      throw new FinancialArticleNotDeletedException();
    }
  }

  ensurePubliclyVisible(article: FinancialArticle): void {
    this.ensureNotDeleted(article);

    if (!article.isActive) {
      throw new FinancialArticleInactiveException();
    }

    if (article.status !== FinancialArticleStatus.PUBLISHED) {
      throw new FinancialArticleInactiveException();
    }
  }

  async ensureCategoryExists(
    categoryRepo: CategoryRepository,
    categoryId: string,
  ): Promise<void> {
    const category = await categoryRepo.findById(categoryId);

    if (!category) {
      throw new CategoryNotFoundException();
    }
  }

  async ensureSlugIsAvailable(
    articleRepo: FinancialArticleRepository,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const exists = await articleRepo.exists(slug, excludeId);

    if (exists) {
      throw new FinancialArticleAlreadyExistsException(
        'Financial article slug already exists.',
      );
    }
  }
}
