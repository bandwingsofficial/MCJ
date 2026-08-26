import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { BranchController } from './presentation/controllers/branch.controller';
import { BranchCourseController } from './presentation/controllers/branch-course.controller';
import { PublicBranchController } from './presentation/controllers/public-branch.controller';

import { AssignCoursesToBranchHandler } from './application/assign-courses-to-branch/assign-courses-to-branch.handler';
import { UnassignCourseFromBranchHandler } from './application/unassign-course-from-branch/unassign-course-from-branch.handler';

import { CreateBranchHandler } from './application/create-branch/create-branch.handler';
import { DeleteBranchHandler } from './application/delete-branch/delete-branch.handler';
import { PermanentDeleteBranchHandler } from './application/permanent-delete-branch/permanent-delete-branch.handler';
import { GetBranchHandler } from './application/get-branch/get-branch.handler';
import { GetBranchSummaryHandler } from './application/get-branch-summary/get-branch-summary.handler';
import { ListBranchesHandler } from './application/list-branches/list-branches.handler';
import { UpdateBranchHandler } from './application/update-branch/update-branch.handler';
import { UpdateBranchStatusHandler } from './application/update-branch-status/update-branch-status.handler';
import { RestoreBranchHandler } from './application/restore-branch/restore-branch.handler';
import { SuggestBranchCodeHandler } from './application/suggest-branch-code/suggest-branch-code.handler';
import { CheckBranchAvailabilityHandler } from './application/check-branch-availability/check-branch-availability.handler';
import { ReorderBranchesHandler } from './application/reorder-branches/reorder-branches.handler';
import { BulkUpdateBranchStatusHandler } from './application/bulk-update-branch-status/bulk-update-branch-status.handler';
import { BulkDeleteBranchesHandler } from './application/bulk-delete-branches/bulk-delete-branches.handler';
import { BulkRestoreBranchesHandler } from './application/bulk-restore-branches/bulk-restore-branches.handler';
import { BulkPermanentDeleteBranchesHandler } from './application/bulk-permanent-delete-branches/bulk-permanent-delete-branches.handler';

import type { BranchRepository } from './domain/repositories/branch.repository';
import { BranchDomainService } from './domain/services/branch-domain.service';

import { PrismaBranchRepository } from './infrastructure/repositories/prisma-branch.repository';

import { BRANCH_TOKENS } from './branch.tokens';

@Module({
  imports: [PrismaModule],

  controllers: [
    BranchController,
    BranchCourseController,
    PublicBranchController,
  ],

  providers: [
    BranchDomainService,

    {
      provide: BRANCH_TOKENS.BRANCH_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaBranchRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateBranchHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new CreateBranchHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: ListBranchesHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new ListBranchesHandler(branchRepo),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
      ],
    },

    {
      provide: GetBranchHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new GetBranchHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: GetBranchSummaryHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new GetBranchSummaryHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: UpdateBranchHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new UpdateBranchHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: UpdateBranchStatusHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new UpdateBranchStatusHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

      {
        provide: RestoreBranchHandler,
        useFactory: (
          branchRepo: BranchRepository,
          domainService: BranchDomainService,
        ) =>
          new RestoreBranchHandler(
            branchRepo,
          ),
        inject: [
          BRANCH_TOKENS.BRANCH_REPOSITORY,
        ],
      },

    {
      provide: DeleteBranchHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new DeleteBranchHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: PermanentDeleteBranchHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new PermanentDeleteBranchHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },

    {
      provide: SuggestBranchCodeHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new SuggestBranchCodeHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: CheckBranchAvailabilityHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new CheckBranchAvailabilityHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: ReorderBranchesHandler,
      useFactory: (
        branchRepo: BranchRepository,
        domainService: BranchDomainService,
      ) =>
        new ReorderBranchesHandler(
          branchRepo,
          domainService,
        ),
      inject: [
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        BranchDomainService,
      ],
    },
    {
      provide: BulkUpdateBranchStatusHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new BulkUpdateBranchStatusHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: BulkDeleteBranchesHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new BulkDeleteBranchesHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: BulkRestoreBranchesHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new BulkRestoreBranchesHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: BulkPermanentDeleteBranchesHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new BulkPermanentDeleteBranchesHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: AssignCoursesToBranchHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new AssignCoursesToBranchHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },

    {
      provide: UnassignCourseFromBranchHandler,
      useFactory: (branchRepo: BranchRepository) =>
        new UnassignCourseFromBranchHandler(branchRepo),
      inject: [BRANCH_TOKENS.BRANCH_REPOSITORY],
    },
  ],
  exports: [BRANCH_TOKENS.BRANCH_REPOSITORY],
})
export class BranchModule {}
