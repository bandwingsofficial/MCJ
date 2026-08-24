import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';

import { CATEGORY_TOKENS } from './category.tokens';
import { CreateCategoryHandler } from './application/create-category/create-category.handler';
import { DeleteCategoryHandler } from './application/delete-category/delete-category.handler';
import { GetCategoryHandler } from './application/get-category/get-category.handler';
import { ListCategoriesHandler } from './application/list-categories/list-categories.handler';
import { PermanentDeleteCategoryHandler } from './application/permanent-delete-category/permanent-delete-category.handler';
import { RestoreCategoryHandler } from './application/restore-category/restore-category.handler';
import { UpdateCategoryHandler } from './application/update-category/update-category.handler';
import { UpdateCategoryStatusHandler } from './application/update-category-status/update-category-status.handler';
import { BulkUpdateCategoryStatusHandler } from './application/bulk-update-category-status/bulk-update-category-status.handler';
import { BulkActivateCategoryHandler } from './application/bulk-activate-category/bulk-activate-category.handler';
import { BulkDeactivateCategoryHandler } from './application/bulk-deactivate-category/bulk-deactivate-category.handler';
import { BulkDeleteCategoryHandler } from './application/bulk-delete-category/bulk-delete-category.handler';
import { BulkRestoreCategoryHandler } from './application/bulk-restore-category/bulk-restore-category.handler';
import { BulkPermanentDeleteCategoryHandler } from './application/bulk-permanent-delete-category/bulk-permanent-delete-category.handler';
import { ReorderCategoriesHandler } from './application/reorder-categories/reorder-categories.handler';
import { GetCategoryDependenciesHandler } from './application/get-category-dependencies/get-category-dependencies.handler';
import { CheckCategoryAvailabilityHandler } from './application/check-category-availability/check-category-availability.handler';
import { AssignCategoriesToBranchHandler } from './application/assign-categories-to-branch/assign-categories-to-branch.handler';
import { UnassignCategoryFromBranchHandler } from './application/unassign-category-from-branch/unassign-category-from-branch.handler';

import type { CategoryRepository } from './domain/repositories/category.repository';
import { CategoryDomainService } from './domain/services/category-domain.service';
import { PrismaCategoryRepository } from './infrastructure/repositories/prisma-category.repository';
import { AdminCategoryController } from './presentation/controllers/admin-category.controller';
import { BranchCategoryController } from './presentation/controllers/branch-category.controller';
import { CategoryController } from './presentation/controllers/category.controller';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';

import { BranchModule } from '../branch/branch.module';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchRepository } from '../branch/domain/repositories/branch.repository';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    BranchModule,
    UploadsModule,
  ],

  controllers: [
    AdminCategoryController,
    BranchCategoryController,
    CategoryController,
  ],

  providers: [
    CategoryDomainService,
    SuperAdminGuard,

    {
      provide: CATEGORY_TOKENS.CATEGORY_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaCategoryRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateCategoryHandler(
          categoryRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
        UploadDomainService,
      ],
    },

    {
      provide: UpdateCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new UpdateCategoryHandler(
          categoryRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
        UploadDomainService,
      ],
    },

    {
      provide: ListCategoriesHandler,
      useFactory: (categoryRepo: CategoryRepository) =>
        new ListCategoriesHandler(categoryRepo),
      inject: [CATEGORY_TOKENS.CATEGORY_REPOSITORY],
    },

    {
      provide: GetCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new GetCategoryHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },

    {
      provide: DeleteCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new DeleteCategoryHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },

    {
      provide: RestoreCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new RestoreCategoryHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },
    {
      provide: BulkRestoreCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new BulkRestoreCategoryHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },

    {
      provide: PermanentDeleteCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new PermanentDeleteCategoryHandler(
          categoryRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: BulkPermanentDeleteCategoryHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        uploadDomainService: UploadDomainService,
      ) =>
        new BulkPermanentDeleteCategoryHandler(
          categoryRepo,
          uploadDomainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        UploadDomainService,
      ],
    },
    {
      provide: BulkDeleteCategoryHandler,
      useFactory: (categoryRepo: CategoryRepository) =>
        new BulkDeleteCategoryHandler(categoryRepo),
      inject: [CATEGORY_TOKENS.CATEGORY_REPOSITORY],
    },

    {
      provide: UpdateCategoryStatusHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new UpdateCategoryStatusHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },
    {
      provide: BulkUpdateCategoryStatusHandler,
      useFactory: (categoryRepo: CategoryRepository) =>
        new BulkUpdateCategoryStatusHandler(categoryRepo),
      inject: [CATEGORY_TOKENS.CATEGORY_REPOSITORY],
    },

    {
      provide: BulkActivateCategoryHandler,
      useFactory: (
        bulkUpdateStatusHandler: BulkUpdateCategoryStatusHandler,
      ) =>
        new BulkActivateCategoryHandler(
          bulkUpdateStatusHandler,
        ),
      inject: [BulkUpdateCategoryStatusHandler],
    },

    {
      provide: BulkDeactivateCategoryHandler,
      useFactory: (
        bulkUpdateStatusHandler: BulkUpdateCategoryStatusHandler,
      ) =>
        new BulkDeactivateCategoryHandler(
          bulkUpdateStatusHandler,
        ),
      inject: [BulkUpdateCategoryStatusHandler],
    },

    {
      provide: ReorderCategoriesHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new ReorderCategoriesHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },

    {
      provide: GetCategoryDependenciesHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
      ) =>
        new GetCategoryDependenciesHandler(
          categoryRepo,
          domainService,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
      ],
    },

    {
      provide: CheckCategoryAvailabilityHandler,
      useFactory: (categoryRepo: CategoryRepository) =>
        new CheckCategoryAvailabilityHandler(categoryRepo),
      inject: [CATEGORY_TOKENS.CATEGORY_REPOSITORY],
    },

    {
      provide: AssignCategoriesToBranchHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        branchRepo: BranchRepository,
      ) =>
        new AssignCategoriesToBranchHandler(
          categoryRepo,
          branchRepo,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },

    {
      provide: UnassignCategoryFromBranchHandler,
      useFactory: (
        categoryRepo: CategoryRepository,
        domainService: CategoryDomainService,
        branchRepo: BranchRepository,
      ) =>
        new UnassignCategoryFromBranchHandler(
          categoryRepo,
          domainService,
          branchRepo,
        ),
      inject: [
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        CategoryDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },
  ],

  exports: [CATEGORY_TOKENS.CATEGORY_REPOSITORY],
})
export class CategoryModule {}
