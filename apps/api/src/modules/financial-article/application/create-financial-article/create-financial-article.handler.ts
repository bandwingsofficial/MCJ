import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import { FinancialArticle } from '../../domain/entities/financial-article.entity';
import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';

import { CreateFinancialArticleCommand } from './create-financial-article.command';

const FINANCIAL_ARTICLE_UPLOAD_FOLDER = 'financial-articles';
const THUMBNAIL_FILE_NAME = 'thumbnail';
const BANNER_FILE_NAME = 'banner';

export class CreateFinancialArticleHandler {
  private readonly logger = new Logger(
    CreateFinancialArticleHandler.name,
  );

  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: FinancialArticleDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: CreateFinancialArticleCommand,
  ): Promise<FinancialArticleAdminResult> {
    await this.domainService.ensureCategoryExists(
      this.categoryRepo,
      command.categoryId,
    );

    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromTitle(command.title).getValue();

    await this.domainService.ensureSlugIsAvailable(
      this.articleRepo,
      slug,
    );

    const displayOrder =
      (await this.articleRepo.getMaxDisplayOrder()) + 1;

    const status = command.status ?? FinancialArticleStatus.DRAFT;
    const publishedAt =
      status === FinancialArticleStatus.PUBLISHED ? new Date() : null;

    const articleId = randomUUID();
    let thumbnailFileId: string | null = null;
    let thumbnailUrl: string | null = null;
    let bannerFileId: string | null = null;
    let bannerUrl: string | null = null;

    if (command.thumbnailFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.thumbnailFileId,
        folder: FINANCIAL_ARTICLE_UPLOAD_FOLDER,
        entityId: articleId,
        fileName: THUMBNAIL_FILE_NAME,
      });

      thumbnailFileId = upload.id;
      thumbnailUrl = upload.url;
    }

    if (command.bannerFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.bannerFileId,
        folder: FINANCIAL_ARTICLE_UPLOAD_FOLDER,
        entityId: articleId,
        fileName: BANNER_FILE_NAME,
      });

      bannerFileId = upload.id;
      bannerUrl = upload.url;
    }

    const article = FinancialArticle.create({
      id: articleId,
      title: command.title,
      slug,
      shortDescription: command.shortDescription,
      content: command.content,
      thumbnailFileId,
      thumbnailUrl,
      bannerFileId,
      bannerUrl,
      authorName: command.authorName,
      authorImage: command.authorImage,
      tags: command.tags,
      categoryId: command.categoryId,
      displayOrder,
      status,
      publishedAt,
      createdBy: command.createdBy,
    });

    await this.articleRepo.save(article);

    this.logger.log(`✅ Financial article created: ${article.id}`);

    const detail = await this.articleRepo.findDetailById(article.id);

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
