import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

import { PLACEMENT_TOKENS } from './placement.tokens';
import { CreatePlacementFromApplicationHandler } from './application/create-placement-from-application/create-placement-from-application.handler';
import { GetMyPlacementHandler } from './application/get-my-placement/get-my-placement.handler';
import { GetPlacementHandler } from './application/get-placement/get-placement.handler';
import { ListPlacementsHandler } from './application/list-placements/list-placements.handler';
import { UpdatePlacementHandler } from './application/update-placement/update-placement.handler';
import type { PlacementRepository } from './domain/repositories/placement.repository';
import { PlacementDomainService } from './domain/services/placement-domain.service';
import { PrismaPlacementRepository } from './infrastructure/repositories/prisma-placement.repository';
import { AdminPlacementController } from './presentation/controllers/placement.controller';
import { StudentPlacementController } from './presentation/controllers/student-placement.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminPlacementController, StudentPlacementController],
  providers: [
    PlacementDomainService,
    SuperAdminGuard,
    {
      provide: PLACEMENT_TOKENS.PLACEMENT_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaPlacementRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreatePlacementFromApplicationHandler,
      useFactory: (
        placementRepo: PlacementRepository,
        domainService: PlacementDomainService,
      ) =>
        new CreatePlacementFromApplicationHandler(
          placementRepo,
          domainService,
        ),
      inject: [
        PLACEMENT_TOKENS.PLACEMENT_REPOSITORY,
        PlacementDomainService,
      ],
    },
    {
      provide: ListPlacementsHandler,
      useFactory: (placementRepo: PlacementRepository) =>
        new ListPlacementsHandler(placementRepo),
      inject: [PLACEMENT_TOKENS.PLACEMENT_REPOSITORY],
    },
    {
      provide: GetPlacementHandler,
      useFactory: (
        placementRepo: PlacementRepository,
        domainService: PlacementDomainService,
      ) => new GetPlacementHandler(placementRepo, domainService),
      inject: [
        PLACEMENT_TOKENS.PLACEMENT_REPOSITORY,
        PlacementDomainService,
      ],
    },
    {
      provide: GetMyPlacementHandler,
      useFactory: (placementRepo: PlacementRepository) =>
        new GetMyPlacementHandler(placementRepo),
      inject: [PLACEMENT_TOKENS.PLACEMENT_REPOSITORY],
    },
    {
      provide: UpdatePlacementHandler,
      useFactory: (
        placementRepo: PlacementRepository,
        domainService: PlacementDomainService,
      ) => new UpdatePlacementHandler(placementRepo, domainService),
      inject: [
        PLACEMENT_TOKENS.PLACEMENT_REPOSITORY,
        PlacementDomainService,
      ],
    },
  ],
  exports: [
    PLACEMENT_TOKENS.PLACEMENT_REPOSITORY,
    PlacementDomainService,
    CreatePlacementFromApplicationHandler,
  ],
})
export class PlacementModule {}
