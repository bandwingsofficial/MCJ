import { Module } from '@nestjs/common';

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { BranchController } from './presentation/controllers/branch.controller';

import { CreateBranchHandler } from './application/create-branch/create-branch.handler';
import { DeleteBranchHandler } from './application/delete-branch/delete-branch.handler';
import { GetBranchHandler } from './application/get-branch/get-branch.handler';
import { ListBranchesHandler } from './application/list-branches/list-branches.handler';
import { UpdateBranchHandler } from './application/update-branch/update-branch.handler';
import { UpdateBranchStatusHandler } from './application/update-branch-status/update-branch-status.handler';
import { RestoreBranchHandler } from './application/restore-branch/restore-branch.handler';

import type { BranchRepository } from './domain/repositories/branch.repository';
import { BranchDomainService } from './domain/services/branch-domain.service';

import { PrismaBranchRepository } from './infrastructure/repositories/prisma-branch.repository';

import { BRANCH_TOKENS } from './branch.tokens';

@Module({
  imports: [PrismaModule],

  controllers: [BranchController],

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
  ],
  exports: [BRANCH_TOKENS.BRANCH_REPOSITORY],
})
export class BranchModule {}
