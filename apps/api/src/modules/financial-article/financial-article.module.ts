import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { CategoryModule } from '../category/category.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';
import { CATEGORY_TOKENS } from '../category/category.tokens';
import type { CategoryRepository } from '../category/domain/repositories/category.repository';

import { FINANCIAL_ARTICLE_TOKENS } from './financial-article.tokens';
import { CreateFinancialArticleHandler } from './application/create-financial-article/create-financial-article.handler';
import { DeleteFinancialArticleHandler } from './application/delete-financial-article/delete-financial-article.handler';
import { GetFinancialArticleBySlugHandler } from './application/get-financial-article-by-slug/get-financial-article-by-slug.handler';
import { GetFinancialArticleHandler } from './application/get-financial-article/get-financial-article.handler';
import { ListFinancialArticlesHandler } from './application/list-financial-articles/list-financial-articles.handler';
import { MoveFinancialArticleHandler } from './application/move-financial-article/move-financial-article.handler';
import { PermanentDeleteFinancialArticleHandler } from './application/permanent-delete-financial-article/permanent-delete-financial-article.handler';
import { RestoreFinancialArticleHandler } from './application/restore-financial-article/restore-financial-article.handler';
import { UpdateFinancialArticleActivationHandler } from './application/update-financial-article-activation/update-financial-article-activation.handler';
import { UpdateFinancialArticleHandler } from './application/update-financial-article/update-financial-article.handler';
import type { FinancialArticleRepository } from './domain/repositories/financial-article.repository';
import { FinancialArticleDomainService } from './domain/services/financial-article-domain.service';
import { PrismaFinancialArticleRepository } from './infrastructure/repositories/prisma-financial-article.repository';
import { AdminFinancialArticleController } from './presentation/controllers/admin-financial-article.controller';
import { FinancialArticleController } from './presentation/controllers/financial-article.controller';

@Module({
  imports: [PrismaModule, AuthModule, CategoryModule, UploadsModule],
  controllers: [
    AdminFinancialArticleController,
    FinancialArticleController,
  ],
  providers: [
    FinancialArticleDomainService,
    SuperAdminGuard,
    {
      provide: FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaFinancialArticleRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        categoryRepo: CategoryRepository,
        domainService: FinancialArticleDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateFinancialArticleHandler(
          articleRepo,
          categoryRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        FinancialArticleDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: UpdateFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        categoryRepo: CategoryRepository,
        domainService: FinancialArticleDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new UpdateFinancialArticleHandler(
          articleRepo,
          categoryRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        FinancialArticleDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: ListFinancialArticlesHandler,
      useFactory: (articleRepo: FinancialArticleRepository) =>
        new ListFinancialArticlesHandler(articleRepo),
      inject: [FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY],
    },
    {
      provide: GetFinancialArticleHandler,
      useFactory: (articleRepo: FinancialArticleRepository) =>
        new GetFinancialArticleHandler(articleRepo),
      inject: [FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY],
    },
    {
      provide: GetFinancialArticleBySlugHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
      ) =>
        new GetFinancialArticleBySlugHandler(articleRepo, domainService),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
      ],
    },
    {
      provide: DeleteFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
      ) =>
        new DeleteFinancialArticleHandler(articleRepo, domainService),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
      ],
    },
    {
      provide: RestoreFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
      ) =>
        new RestoreFinancialArticleHandler(articleRepo, domainService),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
      ],
    },
    {
      provide: MoveFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
      ) => new MoveFinancialArticleHandler(articleRepo, domainService),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
      ],
    },
    {
      provide: PermanentDeleteFinancialArticleHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new PermanentDeleteFinancialArticleHandler(
          articleRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: UpdateFinancialArticleActivationHandler,
      useFactory: (
        articleRepo: FinancialArticleRepository,
        domainService: FinancialArticleDomainService,
      ) =>
        new UpdateFinancialArticleActivationHandler(
          articleRepo,
          domainService,
        ),
      inject: [
        FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY,
        FinancialArticleDomainService,
      ],
    },
  ],
  exports: [FINANCIAL_ARTICLE_TOKENS.FINANCIAL_ARTICLE_REPOSITORY],
})
export class FinancialArticleModule {}
