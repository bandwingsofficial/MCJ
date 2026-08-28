import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';
import { UploadsModule } from '../uploads/uploads.module';
import { UploadDomainService } from '../uploads/domain/services/upload-domain.service';
import { StudentModule } from '../student/student.module';
import { STUDENT_TOKENS } from '../student/student.tokens';
import type { StudentRepository } from '../student/domain/repositories/student.repository';
import { JobModule } from '../job/job.module';
import { JOB_TOKENS } from '../job/job.tokens';
import type { JobRepository } from '../job/domain/repositories/job.repository';
import { JobDomainService } from '../job/domain/services/job-domain.service';
import { PlacementModule } from '../placement/placement.module';
import { CreatePlacementFromApplicationHandler } from '../placement/application/create-placement-from-application/create-placement-from-application.handler';

import { JOB_APPLICATION_TOKENS } from './job-application.tokens';
import { CreateJobApplicationHandler } from './application/create-job-application/create-job-application.handler';
import { CreatePublicJobApplicationHandler } from './application/create-public-job-application/create-public-job-application.handler';
import { UploadFileHandler } from '../uploads/application/upload-file/upload-file.handler';
import { DeleteJobApplicationHandler } from './application/delete-job-application/delete-job-application.handler';
import { GetJobApplicationHandler } from './application/get-job-application/get-job-application.handler';
import { GetMyJobApplicationHandler } from './application/get-my-job-application/get-my-job-application.handler';
import { ListJobApplicationsHandler } from './application/list-job-applications/list-job-applications.handler';
import { ListMyJobApplicationsHandler } from './application/list-my-job-applications/list-my-job-applications.handler';
import { RestoreJobApplicationHandler } from './application/restore-job-application/restore-job-application.handler';
import { PermanentDeleteJobApplicationHandler } from './application/permanent-delete-job-application/permanent-delete-job-application.handler';
import { UpdateJobApplicationStatusHandler } from './application/update-job-application-status/update-job-application-status.handler';
import type { JobApplicationRepository } from './domain/repositories/job-application.repository';
import { JobApplicationDomainService } from './domain/services/job-application-domain.service';
import { PrismaJobApplicationRepository } from './infrastructure/repositories/prisma-job-application.repository';
import {
  AdminJobApplicationController,
  PublicJobApplicationController,
} from './presentation/controllers/job-application.controller';
import { PublicGuestJobApplicationController } from './presentation/controllers/public-guest-job-application.controller';
import { StudentJobApplicationController } from './presentation/controllers/student-job-application.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UploadsModule,
    StudentModule,
    JobModule,
    PlacementModule,
  ],
  controllers: [
    PublicGuestJobApplicationController,
    PublicJobApplicationController,
    AdminJobApplicationController,
    StudentJobApplicationController,
  ],
  providers: [
    JobApplicationDomainService,
    SuperAdminGuard,
    {
      provide: JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaJobApplicationRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        jobRepo: JobRepository,
        studentRepo: StudentRepository,
        jobDomainService: JobDomainService,
        domainService: JobApplicationDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreateJobApplicationHandler(
          applicationRepo,
          jobRepo,
          studentRepo,
          jobDomainService,
          domainService,
          uploadDomainService,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JOB_TOKENS.JOB_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        JobDomainService,
        JobApplicationDomainService,
        UploadDomainService,
      ],
    },
    {
      provide: CreatePublicJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        jobRepo: JobRepository,
        jobDomainService: JobDomainService,
        domainService: JobApplicationDomainService,
        uploadFileHandler: UploadFileHandler,
        uploadDomainService: UploadDomainService,
      ) =>
        new CreatePublicJobApplicationHandler(
          applicationRepo,
          jobRepo,
          jobDomainService,
          domainService,
          uploadFileHandler,
          uploadDomainService,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JOB_TOKENS.JOB_REPOSITORY,
        JobDomainService,
        JobApplicationDomainService,
        UploadFileHandler,
        UploadDomainService,
      ],
    },
    {
      provide: ListJobApplicationsHandler,
      useFactory: (applicationRepo: JobApplicationRepository) =>
        new ListJobApplicationsHandler(applicationRepo),
      inject: [JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY],
    },
    {
      provide: GetJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        domainService: JobApplicationDomainService,
      ) =>
        new GetJobApplicationHandler(applicationRepo, domainService),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JobApplicationDomainService,
      ],
    },
    {
      provide: ListMyJobApplicationsHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        studentRepo: StudentRepository,
      ) =>
        new ListMyJobApplicationsHandler(
          applicationRepo,
          studentRepo,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
      ],
    },
    {
      provide: GetMyJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        studentRepo: StudentRepository,
        domainService: JobApplicationDomainService,
      ) =>
        new GetMyJobApplicationHandler(
          applicationRepo,
          studentRepo,
          domainService,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        STUDENT_TOKENS.STUDENT_REPOSITORY,
        JobApplicationDomainService,
      ],
    },
    {
      provide: UpdateJobApplicationStatusHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        jobRepo: JobRepository,
        domainService: JobApplicationDomainService,
        jobDomainService: JobDomainService,
        createPlacementHandler: CreatePlacementFromApplicationHandler,
      ) =>
        new UpdateJobApplicationStatusHandler(
          applicationRepo,
          jobRepo,
          domainService,
          jobDomainService,
          createPlacementHandler,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JOB_TOKENS.JOB_REPOSITORY,
        JobApplicationDomainService,
        JobDomainService,
        CreatePlacementFromApplicationHandler,
      ],
    },
    {
      provide: DeleteJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        domainService: JobApplicationDomainService,
      ) =>
        new DeleteJobApplicationHandler(applicationRepo, domainService),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JobApplicationDomainService,
      ],
    },
    {
      provide: RestoreJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        domainService: JobApplicationDomainService,
      ) =>
        new RestoreJobApplicationHandler(applicationRepo, domainService),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JobApplicationDomainService,
      ],
    },
    {
      provide: PermanentDeleteJobApplicationHandler,
      useFactory: (
        applicationRepo: JobApplicationRepository,
        domainService: JobApplicationDomainService,
        uploadDomainService: UploadDomainService,
      ) =>
        new PermanentDeleteJobApplicationHandler(
          applicationRepo,
          domainService,
          uploadDomainService,
        ),
      inject: [
        JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
        JobApplicationDomainService,
        UploadDomainService,
      ],
    },
  ],
  exports: [
    JOB_APPLICATION_TOKENS.JOB_APPLICATION_REPOSITORY,
    JobApplicationDomainService,
    ListJobApplicationsHandler,
    GetJobApplicationHandler,
    UpdateJobApplicationStatusHandler,
  ],
})
export class JobApplicationModule {}
