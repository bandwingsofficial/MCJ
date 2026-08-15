import { Module, forwardRef } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_TOKENS } from '../course/course.tokens';
import { CourseModule } from '../course/course.module';
import type { CourseRepository } from '../course/domain/repositories/course.repository';
import { TRAINER_TOKENS } from '../trainer/trainer.tokens';
import { TrainerModule } from '../trainer/trainer.module';
import type { TrainerRepository } from '../trainer/domain/repositories/trainer.repository';

import { BATCH_TOKENS } from './batch.tokens';
import { AssignBatchTrainersHandler } from './application/assign-batch-trainers/assign-batch-trainers.handler';
import { BulkDeleteBatchesHandler } from './application/bulk-delete-batches/bulk-delete-batches.handler';
import { BulkPermanentDeleteBatchesHandler } from './application/bulk-permanent-delete-batches/bulk-permanent-delete-batches.handler';
import { BulkRestoreBatchesHandler } from './application/bulk-restore-batches/bulk-restore-batches.handler';
import { BulkUpdateBatchStatusHandler } from './application/bulk-update-batch-status/bulk-update-batch-status.handler';
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
import { BatchDomainService } from './domain/services/batch-domain.service';
import { PrismaBatchRepository } from './infrastructure/repositories/prisma-batch.repository';

import { AdminBatchController } from './presentation/controllers/admin-batch.controller';
import { BatchController } from './presentation/controllers/batch.controller';

import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';
import type { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { EnrollmentModule } from '../enrollment/enrollment.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    forwardRef(() => CourseModule),
    TrainerModule,
    BranchModule,
    forwardRef(() => EnrollmentModule),
  ],

  controllers: [
    AdminBatchController,
    BatchController,
  ],

  providers: [
    BatchDomainService,
    SuperAdminGuard,

    {
      provide: BATCH_TOKENS.BATCH_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaBatchRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        courseRepo: CourseRepository,
        trainerRepo: TrainerRepository,
        branchRepo: BranchRepository,
        domainService: BatchDomainService,
      ) =>
        new CreateBatchHandler(
          batchRepo,
          courseRepo,
          trainerRepo,
          branchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: UpdateBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        courseRepo: CourseRepository,
        branchRepo: BranchRepository,
        domainService: BatchDomainService,
      ) =>
        new UpdateBatchHandler(
          batchRepo,
          courseRepo,
          branchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: ListBatchesHandler,
      useFactory: (batchRepo: BatchRepository) =>
        new ListBatchesHandler(batchRepo),
      inject: [BATCH_TOKENS.BATCH_REPOSITORY],
    },

    {
      provide: GetBatchHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new GetBatchHandler(
          batchRepo,
          domainService,
        ),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
      ],
    },

    {
      provide: GetBatchSummaryHandler,
      useFactory: (
        batchRepo: BatchRepository,
        domainService: BatchDomainService,
      ) =>
        new GetBatchSummaryHandler(batchRepo, domainService),
      inject: [
        BATCH_TOKENS.BATCH_REPOSITORY,
        BatchDomainService,
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
  ],

  exports: [BATCH_TOKENS.BATCH_REPOSITORY],
})
export class BatchModule {}
