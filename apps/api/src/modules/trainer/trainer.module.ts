import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

import { AuthModule } from '../auth/auth.module';
import { COURSE_TOKENS } from '../course/course.tokens';
import { CourseModule } from '../course/course.module';
import type { CourseRepository } from '../course/domain/repositories/course.repository';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';

import { TRAINER_TOKENS } from './trainer.tokens';
import { AssignTrainerCoursesHandler } from './application/assign-trainer-courses/assign-trainer-courses.handler';
import { CreateTrainerHandler } from './application/create-trainer/create-trainer.handler';
import { DeleteTrainerHandler } from './application/delete-trainer/delete-trainer.handler';
import { GetTrainerHandler } from './application/get-trainer/get-trainer.handler';
import { ListTrainersHandler } from './application/list-trainers/list-trainers.handler';
import { PermanentDeleteTrainerHandler } from './application/permanent-delete-trainer/permanent-delete-trainer.handler';
import { RestoreTrainerHandler } from './application/restore-trainer/restore-trainer.handler';
import { UpdateTrainerHandler } from './application/update-trainer/update-trainer.handler';
import { UpdateTrainerStatusHandler } from './application/update-trainer-status/update-trainer-status.handler';
import type { TrainerRepository } from './domain/repositories/trainer.repository';
import { TrainerDomainService } from './domain/services/trainer-domain.service';
import { PrismaTrainerRepository } from './infrastructure/repositories/prisma-trainer.repository';
import { AdminTrainerController } from './presentation/controllers/admin-trainer.controller';
import { TrainerController } from './presentation/controllers/trainer.controller';
import { BranchRepository } from '../branch/domain/repositories/branch.repository';
import { BRANCH_TOKENS } from '../branch/branch.tokens';
import { BranchModule } from '../branch/branch.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    CourseModule,
    UploadsModule,
    BranchModule,
  ],

  controllers: [
    AdminTrainerController,
    TrainerController,
  ],

  providers: [
    TrainerDomainService,
    SuperAdminGuard,

    {
      provide: TRAINER_TOKENS.TRAINER_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaTrainerRepository(prisma),
      inject: [PrismaService],
    },

    {
      provide: CreateTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        courseRepo: CourseRepository,
        domainService: TrainerDomainService,
        branchRepo: BranchRepository,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateTrainerHandler(
          trainerRepo,
          courseRepo,
          domainService,
          branchRepo,
          uploadDomainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        TrainerDomainService,
        BRANCH_TOKENS.BRANCH_REPOSITORY,
        UploadDomainService,
      ],
    },

    {
      provide: UpdateTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        uploadDomainService: UploadDomainService,
        domainService: TrainerDomainService,
      ) =>
        new UpdateTrainerHandler(
          trainerRepo,
          uploadDomainService,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        UploadDomainService,
        TrainerDomainService,
      ],
    },

    {
      provide: ListTrainersHandler,
      useFactory: (trainerRepo: TrainerRepository) =>
        new ListTrainersHandler(trainerRepo),
      inject: [TRAINER_TOKENS.TRAINER_REPOSITORY],
    },

    {
      provide: GetTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        domainService: TrainerDomainService,
      ) =>
        new GetTrainerHandler(
          trainerRepo,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        TrainerDomainService,
      ],
    },

    {
      provide: DeleteTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        domainService: TrainerDomainService,
      ) =>
        new DeleteTrainerHandler(
          trainerRepo,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        TrainerDomainService,
      ],
    },

    {
      provide: RestoreTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        domainService: TrainerDomainService,
      ) =>
        new RestoreTrainerHandler(
          trainerRepo,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        TrainerDomainService,
      ],
    },

    {
      provide: PermanentDeleteTrainerHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        uploadDomainService: UploadDomainService,
        domainService: TrainerDomainService,
      ) =>
        new PermanentDeleteTrainerHandler(
          trainerRepo,
          uploadDomainService,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        UploadDomainService,
        TrainerDomainService,
      ],
    },

    {
      provide: UpdateTrainerStatusHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        domainService: TrainerDomainService,
      ) =>
        new UpdateTrainerStatusHandler(
          trainerRepo,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        TrainerDomainService,
      ],
    },

    {
      provide: AssignTrainerCoursesHandler,
      useFactory: (
        trainerRepo: TrainerRepository,
        courseRepo: CourseRepository,
        domainService: TrainerDomainService,
      ) =>
        new AssignTrainerCoursesHandler(
          trainerRepo,
          courseRepo,
          domainService,
        ),
      inject: [
        TRAINER_TOKENS.TRAINER_REPOSITORY,
        COURSE_TOKENS.COURSE_REPOSITORY,
        TrainerDomainService,
      ],
    },
  ],

  exports: [TRAINER_TOKENS.TRAINER_REPOSITORY],
})
export class TrainerModule {}
