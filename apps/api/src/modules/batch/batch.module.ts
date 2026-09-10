import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { CATEGORY_TOKENS } from '../category/category.tokens';
import { CategoryModule } from '../category/category.module';
import type { CategoryRepository } from '../category/domain/repositories/category.repository';
import { COURSE_TOKENS } from '../course/course.tokens';
import { CourseModule } from '../course/course.module';
import type { CourseRepository } from '../course/domain/repositories/course.repository';
import { TRAINER_TOKENS } from '../trainer/trainer.tokens';
import { TrainerModule } from '../trainer/trainer.module';
import type { TrainerRepository } from '../trainer/domain/repositories/trainer.repository';

import { BATCH_TOKENS } from './batch.tokens';
import { AssignBatchTrainersHandler } from './application/assign-batch-trainers/assign-batch-trainers.handler';
import { AssignBatchCourseHandler } from './application/batch-courses/assign-batch-course.handler';
import { ListBatchCoursesHandler } from './application/batch-courses/list-batch-courses.handler';
import { RemoveBatchCourseHandler } from './application/batch-courses/remove-batch-course.handler';
import { BulkDeleteBatchesHandler } from './application/bulk-delete-batches/bulk-delete-batches.handler';
import { BulkPermanentDeleteBatchesHandler } from './application/bulk-permanent-delete-batches/bulk-permanent-delete-batches.handler';
import { BulkRestoreBatchesHandler } from './application/bulk-restore-batches/bulk-restore-batches.handler';
import { BulkUpdateBatchStatusHandler } from './application/bulk-update-batch-status/bulk-update-batch-status.handler';
import {
  SoftDeleteBatchTemplateHandler,
  RestoreBatchTemplateHandler,
  PermanentDeleteBatchTemplateHandler,
} from './application/batch-templates/archive-batch-template.handlers';
import {
  BulkArchiveBatchTemplatesHandler,
  BulkPermanentDeleteBatchTemplatesHandler,
  BulkRestoreBatchTemplatesHandler,
  BulkSetBatchTemplateActiveHandler,
} from './application/batch-templates/bulk-batch-template.handlers';
import { CreateBatchTemplateHandler } from './application/batch-templates/create-batch-template.handler';
import { CreateBatchWithTimingsHandler } from './application/batch-timings/create-batch-with-timings.handler';
import { UpdateBatchTimingHandler } from './application/batch-timings/update-batch-timing.handler';
import { GetBatchTemplateHandler } from './application/batch-templates/get-batch-template.handler';
import { ListBatchTemplatesHandler } from './application/batch-templates/list-batch-templates.handler';
import { SetBatchTemplateActiveHandler } from './application/batch-templates/set-batch-template-active.handler';
import { UpdateBatchTemplateHandler } from './application/batch-templates/update-batch-template.handler';
import { CreateBatchHandler } from './application/create-batch/create-batch.handler';
import { DeleteBatchHandler } from './application/delete-batch/delete-batch.handler';
import { GetBatchHandler } from './application/get-batch/get-batch.handler';
import { GetBatchSummaryHandler } from './application/get-batch-summary/get-batch-summary.handler';
import { ListBatchesHandler } from './application/list-batches/list-batches.handler';
import { PermanentDeleteBatchHandler } from './application/permanent-delete-batch/permanent-delete-batch.handler';
import { ReorderBatchesHandler } from './application/reorder-batches/reorder-batches.handler';
import { RestoreBatchHandler } from './application/restore-batch/restore-batch.handler';
import { SuggestBatchCodeHandler } from './application/suggest-batch-code/suggest-batch-code.handler';
import { UpdateBatchHandler } from './application/update-batch/update-batch.handler';
import { UpdateBatchStatusHandler } from './application/update-batch-status/update-batch-status.handler';
import type { BatchRepository } from './domain/repositories/batch.repository';
import type { BatchTemplateRepository } from './domain/repositories/batch-template.repository';
import { BatchDomainService } from './domain/services/batch-domain.service';
import { PrismaBatchCourseRepository } from './infrastructure/repositories/prisma-batch-course.repository';
import { PrismaBatchRepository } from './infrastructure/repositories/prisma-batch.repository';
import { PrismaBatchTemplateRepository } from './infrastructure/repositories/prisma-batch-template.repository';

import { AdminBatchController } from './presentation/controllers/admin-batch.controller';
import { AdminBatchTemplateController } from './presentation/controllers/admin-batch-template.controller';
import { BatchController } from './presentation/controllers/batch.controller';
import { BatchCalendarService } from './application/batch-calendar/batch-calendar.service';

import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';
import type { BranchRepository } from '../branch/domain/repositories/branch.repository';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    // Course <-> Enrollment <-> Batch is a genuine module cycle.
    forwardRef(() => CourseModule),
    CategoryModule,
    TrainerModule,
    BranchModule,
  ],

  controllers: [
    AdminBatchController,
    AdminBatchTemplateController,
    BatchController,
  ],

  providers: [
    BatchDomainService,
    BatchCalendarService,
    SuperAdminGuard,

    {
      provide: BATCH_TOKENS.BATCH_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaBatchRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaBatchTemplateRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: PrismaBatchCourseRepository,
      useFactory: (prisma: PrismaService) =>
        new PrismaBatchCourseRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        courseRepo: CourseRepository,
        categoryRepo: CategoryRepository,
        trainerRepo: TrainerRepository,
        branchRepo: BranchRepository,
        batchCourseRepo: PrismaBatchCourseRepository,
        domainService: BatchDomainService,
      ) =>
        new CreateBatchHandler(
          batchRepo,
          courseRepo,
          categoryRepo,
          trainerRepo,
          branchRepo,
          batchCourseRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        PrismaBatchCourseRepository,
        BatchDomainService,
      ],
    },

    {
      provide: UpdateBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        courseRepo: CourseRepository,
        categoryRepo: CategoryRepository,
        branchRepo: BranchRepository,
        batchCourseRepo: PrismaBatchCourseRepository,
        domainService: BatchDomainService,
        templateRepo: BatchTemplateRepository,
        prisma: PrismaService,
      ) =>
        new UpdateBatchHandler(
          batchRepo,
          courseRepo,
          categoryRepo,
          branchRepo,
          batchCourseRepo,
          domainService,
          templateRepo,
          prisma,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        CATEGORY_TOKENS.CATEGORY_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        PrismaBatchCourseRepository,
        BatchDomainService,
        BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY,
        PrismaService,
      ],
    },

    {
      provide: ListBatchesHandler,
      useFactory: (
        batchRepo: BatchRepository,
        prisma: PrismaService,
      ) => new ListBatchesHandler(batchRepo, prisma),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY, PrismaService],
    },

    {
      provide: GetBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
        prisma: PrismaService,
      ) =>
        new GetBatchHandler(
          batchRepo,
          domainService,
          prisma,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
        PrismaService,
      ],
    },

    {
      provide: GetBatchSummaryHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
        prisma: PrismaService,
      ) =>
        new GetBatchSummaryHandler(batchRepo, domainService, prisma),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
        PrismaService,
      ],
    },

    {
      provide: DeleteBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new DeleteBatchHandler(
          batchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: RestoreBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new RestoreBatchHandler(
          batchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: PermanentDeleteBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new PermanentDeleteBatchHandler(
          batchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: UpdateBatchStatusHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new UpdateBatchStatusHandler(
          batchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: ListBatchCoursesHandler,
      useFactory: (batchCourseRepo: PrismaBatchCourseRepository) =>
        new ListBatchCoursesHandler(batchCourseRepo),
      inject: [PrismaBatchCourseRepository],
    },

    {
      provide: AssignBatchCourseHandler,
      useFactory: (
        batchRepo: BatchRepository,
        batchCourseRepo: PrismaBatchCourseRepository,
        courseRepo: CourseRepository,
        domainService: BatchDomainService,
      ) =>
        new AssignBatchCourseHandler(
          batchRepo,
          batchCourseRepo,
          courseRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        PrismaBatchCourseRepository,
        COURSE_TOKENS.COURSE_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: RemoveBatchCourseHandler,
      useFactory: (
        batchRepo: BatchRepository,
        batchCourseRepo: PrismaBatchCourseRepository,
        domainService: BatchDomainService,
      ) =>
        new RemoveBatchCourseHandler(
          batchRepo,
          batchCourseRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        PrismaBatchCourseRepository,
        BatchDomainService,
      ],
    },

    {
      provide: AssignBatchTrainersHandler,
      useFactory: (
        batchRepo: BatchRepository,
        trainerRepo: TrainerRepository,
        domainService: BatchDomainService,
      ) =>
        new AssignBatchTrainersHandler(
          batchRepo,
          trainerRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: SuggestBatchCodeHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new SuggestBatchCodeHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: ReorderBatchesHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new ReorderBatchesHandler(batchRepo, domainService),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: BulkUpdateBatchStatusHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new BulkUpdateBatchStatusHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: BulkDeleteBatchesHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new BulkDeleteBatchesHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: BulkRestoreBatchesHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new BulkRestoreBatchesHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: BulkPermanentDeleteBatchesHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new BulkPermanentDeleteBatchesHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: CreateBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new CreateBatchTemplateHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: UpdateBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository, prisma: PrismaService) =>
        new UpdateBatchTemplateHandler(templateRepo, prisma),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY, PrismaService],
    },

    {
      provide: ListBatchTemplatesHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new ListBatchTemplatesHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: GetBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new GetBatchTemplateHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: SetBatchTemplateActiveHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new SetBatchTemplateActiveHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: SoftDeleteBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new SoftDeleteBatchTemplateHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: RestoreBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new RestoreBatchTemplateHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: PermanentDeleteBatchTemplateHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new PermanentDeleteBatchTemplateHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: BulkSetBatchTemplateActiveHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new BulkSetBatchTemplateActiveHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: BulkArchiveBatchTemplatesHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new BulkArchiveBatchTemplatesHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: BulkRestoreBatchTemplatesHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new BulkRestoreBatchTemplatesHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: BulkPermanentDeleteBatchTemplatesHandler,
      useFactory: (templateRepo: BatchTemplateRepository) =>
        new BulkPermanentDeleteBatchTemplatesHandler(templateRepo),
      inject: [BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY],
    },

    {
      provide: CreateBatchWithTimingsHandler,
      useFactory: (
        templateRepo: BatchTemplateRepository,
        courseRepo: CourseRepository,
        batchRepo: BatchRepository,
        createBatchHandler: CreateBatchHandler,
        prisma: PrismaService,
      ) =>
        new CreateBatchWithTimingsHandler(
          templateRepo,
          courseRepo,
          batchRepo,
          createBatchHandler,
          prisma,
        ),
      inject: [
        BATCH_TOKENS.BATCH_TEMPLATE_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        BATCH_TOKENS.BATCH_REPOSITORY,
        CreateBatchHandler,
        PrismaService,
      ],
    },

    {
      provide: UpdateBatchTimingHandler,
      useFactory: (prisma: PrismaService, getBatchHandler: GetBatchHandler) =>
        new UpdateBatchTimingHandler(prisma, getBatchHandler),
      inject: [PrismaService, GetBatchHandler],
    },
  ],

  exports: [BATCH_TOKENS.BATCH_REPOSITORY, BatchCalendarService],
})
export class BatchModule {}
