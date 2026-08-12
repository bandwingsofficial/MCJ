// src/modules/profile/profile.module.ts

import { Module, forwardRef } from '@nestjs/common';

// =====================
// CONTROLLERS
// =====================

import { ProfileController } from './presentation/controllers/public-profile.controller';

import { AdminProfileController } from './presentation/controllers/admin-profile.controller';

// =====================
// HANDLERS
// =====================

import { CreateProfileHandler } from './application/create-profile/create-profile.handler';

import { UpdateProfileHandler } from './application/update-profile/update-profile.handler';

import { GetProfileHandler } from './application/get-profile/get-profile.handler';

import { DeleteProfileHandler } from './application/delete-profile/delete-profile.handler';

// =====================
// REPOSITORIES
// =====================

import { PrismaProfileRepository } from './infrastructure/repositories/prisma-profile.repository';

// =====================
// DOMAIN REPOSITORY TYPES
// =====================

import { ProfileRepository } from './domain/repositories/profile.repository';

// =====================
// DOMAIN SERVICES
// =====================

import { ProfileDomainService } from './domain/services/profile-domain.service';

// =====================
// INFRA
// =====================

import { PrismaModule } from '../../infrastructure/prisma/prisma.module';

import { PrismaService } from '../../infrastructure/prisma/prisma.service';

// =====================
// TOKENS
// =====================

import { PROFILE_TOKENS } from './profile.tokens';

import { StudentModule } from '../student/student.module';
import { SyncStudentFromProfileHandler } from '../student/application/sync-student-from-profile/sync-student-from-profile.handler';

@Module({
  imports: [PrismaModule, forwardRef(() => StudentModule)],

  controllers: [
    ProfileController,

    AdminProfileController,
  ],

  providers: [
    // =====================
    // DOMAIN SERVICES
    // =====================

    ProfileDomainService,

    // =====================
    // REPOSITORIES
    // =====================

    {
      provide: PROFILE_TOKENS.PROFILE_REPOSITORY,

      useFactory: (prisma: PrismaService) =>
        new PrismaProfileRepository(prisma),

      inject: [PrismaService],
    },

    // =====================
    // HANDLERS
    // =====================

    {
      provide: CreateProfileHandler,

      useFactory: (
        profileRepo: ProfileRepository,
        domainService: ProfileDomainService,
      ) =>
        new CreateProfileHandler(
          profileRepo,
          domainService,
        ),

      inject: [
        PROFILE_TOKENS.PROFILE_REPOSITORY,

        ProfileDomainService,
      ],
    },

    {
      provide: UpdateProfileHandler,

      useFactory: (
        profileRepo: ProfileRepository,
        domainService: ProfileDomainService,
        syncStudentFromProfileHandler: SyncStudentFromProfileHandler,
      ) =>
        new UpdateProfileHandler(
          profileRepo,
          domainService,
          syncStudentFromProfileHandler,
        ),

      inject: [
        PROFILE_TOKENS.PROFILE_REPOSITORY,

        ProfileDomainService,

        SyncStudentFromProfileHandler,
      ],
    },

    {
      provide: GetProfileHandler,

      useFactory: (
        profileRepo: ProfileRepository,
        domainService: ProfileDomainService,
      ) =>
        new GetProfileHandler(
          profileRepo,
          domainService,
        ),

      inject: [
        PROFILE_TOKENS.PROFILE_REPOSITORY,

        ProfileDomainService,
      ],
    },

    {
      provide: DeleteProfileHandler,

      useFactory: (
        profileRepo: ProfileRepository,
        domainService: ProfileDomainService,
      ) =>
        new DeleteProfileHandler(
          profileRepo,
          domainService,
        ),

      inject: [
        PROFILE_TOKENS.PROFILE_REPOSITORY,

        ProfileDomainService,
      ],
    },
  ],

  exports: [
    CreateProfileHandler,
    UpdateProfileHandler,
    GetProfileHandler,
    PROFILE_TOKENS.PROFILE_REPOSITORY,
  ],
})
export class ProfileModule {}