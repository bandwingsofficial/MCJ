import { Module } from '@nestjs/common';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { PrismaModule } from '../../infrastructure/prisma/prisma.module';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

import { JOB_TOKENS } from './job.tokens';
import { CreateJobHandler } from './application/create-job/create-job.handler';
import { DeleteJobHandler } from './application/delete-job/delete-job.handler';
import { GetJobBySlugHandler } from './application/get-job-by-slug/get-job-by-slug.handler';
import { GetJobHandler } from './application/get-job/get-job.handler';
import { ListJobsHandler } from './application/list-jobs/list-jobs.handler';
import { PermanentDeleteJobHandler } from './application/permanent-delete-job/permanent-delete-job.handler';
import { RestoreJobHandler } from './application/restore-job/restore-job.handler';
import { UpdateJobActivationHandler } from './application/update-job-activation/update-job-activation.handler';
import { UpdateJobHandler } from './application/update-job/update-job.handler';
import type { JobRepository } from './domain/repositories/job.repository';
import { JobDomainService } from './domain/services/job-domain.service';
import { PrismaJobRepository } from './infrastructure/repositories/prisma-job.repository';
import { AdminJobController } from './presentation/controllers/admin-job.controller';
import { JobController } from './presentation/controllers/job.controller';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AdminJobController, JobController],
  providers: [
    JobDomainService,
    SuperAdminGuard,
    {
      provide: JOB_TOKENS.JOB_REPOSITORY,
      useFactory: (prisma: PrismaService) =>
        new PrismaJobRepository(prisma),
      inject: [PrismaService],
    },
    {
      provide: CreateJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new CreateJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: UpdateJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new UpdateJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: ListJobsHandler,
      useFactory: (jobRepo: JobRepository) =>
        new ListJobsHandler(jobRepo),
      inject: [JOB_TOKENS.JOB_REPOSITORY],
    },
    {
      provide: GetJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new GetJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: GetJobBySlugHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new GetJobBySlugHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: DeleteJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new DeleteJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: RestoreJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new RestoreJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: PermanentDeleteJobHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new PermanentDeleteJobHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
    {
      provide: UpdateJobActivationHandler,
      useFactory: (
        jobRepo: JobRepository,
        domainService: JobDomainService,
      ) => new UpdateJobActivationHandler(jobRepo, domainService),
      inject: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
    },
  ],
  exports: [JOB_TOKENS.JOB_REPOSITORY, JobDomainService],
})
export class JobModule {}
