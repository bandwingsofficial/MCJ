import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { FinancialArticleAdminResult } from '../financial-article.result';
import { FinancialArticleNotFoundException } from '../../domain/errors/financial-article-business.exception';
import { FinancialArticleStatus } from '../../domain/enums/financial-article-status.enum';
import type { FinancialArticleRepository } from '../../domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from '../../domain/services/financial-article-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';

import { UpdateFinancialArticleCommand } from './update-financial-article.command';

const FINANCIAL_ARTICLE_UPLOAD_FOLDER = 'financial-articles';
const THUMBNAIL_FILE_NAME = 'thumbnail';
const BANNER_FILE_NAME = 'banner';

export class UpdateFinancialArticleHandler {
  constructor(
    private readonly articleRepo: FinancialArticleRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: FinancialArticleDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: UpdateFinancialArticleCommand,
  ): Promise<FinancialArticleAdminResult> {
    const article = this.domainService.ensureExists(
      await this.articleRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(article);

    if (command.categoryId) {
      await this.domainService.ensureCategoryExists(
        this.categoryRepo,
        command.categoryId,
      );
    }

    if (command.slug) {
      await this.domainService.ensureSlugIsAvailable(
        this.articleRepo,
        Slug.create(command.slug).getValue(),
        article.id,
      );
    } else if (command.title) {
      const slug = Slug.fromTitle(command.title).getValue();
      await this.domainService.ensureSlugIsAvailable(
        this.articleRepo,
        slug,
        article.id,
      );
    }

    let publishedAt = article.publishedAt;

    if (
      command.status === FinancialArticleStatus.PUBLISHED &&
      article.status !== FinancialArticleStatus.PUBLISHED
    ) {
      publishedAt = new Date();
    }

    let nextThumbnailFileId = article.thumbnailFileId;
    let nextThumbnailUrl = article.thumbnailUrl;
    let nextBannerFileId = article.bannerFileId;
    let nextBannerUrl = article.bannerUrl;

    if (
      command.thumbnailFileId !== undefined &&
      command.thumbnailFileId !== article.thumbnailFileId
    ) {
      if (command.thumbnailFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: article.thumbnailFileId,
            nextUploadId: command.thumbnailFileId,
            folder: FINANCIAL_ARTICLE_UPLOAD_FOLDER,
            entityId: article.id,
            fileName: THUMBNAIL_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextThumbnailFileId = upload.id;
        nextThumbnailUrl = upload.url;
      } else {
        if (article.thumbnailFileId) {
          await this.uploadDomainService.softDelete(
            article.thumbnailFileId,
            command.updatedBy,
          );
        }

        nextThumbnailFileId = null;
        nextThumbnailUrl = null;
      }
    }

    if (
      command.bannerFileId !== undefined &&
      command.bannerFileId !== article.bannerFileId
    ) {
      if (command.bannerFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: article.bannerFileId,
            nextUploadId: command.bannerFileId,
            folder: FINANCIAL_ARTICLE_UPLOAD_FOLDER,
            entityId: article.id,
            fileName: BANNER_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextBannerFileId = upload.id;
        nextBannerUrl = upload.url;
      } else {
        if (article.bannerFileId) {
          await this.uploadDomainService.softDelete(
            article.bannerFileId,
            command.updatedBy,
          );
        }

        nextBannerFileId = null;
        nextBannerUrl = null;
      }
    }

    article.update({
      title: command.title,
      slug: command.slug,
      shortDescription: command.shortDescription,
      content: command.content,
      thumbnailFileId: nextThumbnailFileId,
      thumbnailUrl: nextThumbnailUrl,
      bannerFileId: nextBannerFileId,
      bannerUrl: nextBannerUrl,
      authorName: command.authorName,
      authorImage: command.authorImage,
      tags: command.tags,
      categoryId: command.categoryId,
      status: command.status,
      publishedAt,
      updatedBy: command.updatedBy,
    });

    await this.articleRepo.save(article);

    const detail = await this.articleRepo.findDetailById(article.id);

    if (!detail) {
      throw new FinancialArticleNotFoundException();
    }

    return FinancialArticleAdminResult.fromDetail(detail);
  }
}
