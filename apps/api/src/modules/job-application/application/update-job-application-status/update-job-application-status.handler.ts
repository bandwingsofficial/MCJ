import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';
import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { UpdateJobApplicationStatusCommand } from './update-job-application-status.command';

import type { JobRepository } from '@modules/job/domain/repositories/job.repository';
import { JobDomainService } from '@modules/job/domain/services/job-domain.service';
import { CreatePlacementFromApplicationCommand } from '@modules/placement/application/create-placement-from-application/create-placement-from-application.command';
import { CreatePlacementFromApplicationHandler } from '@modules/placement/application/create-placement-from-application/create-placement-from-application.handler';

export class UpdateJobApplicationStatusHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobApplicationDomainService,
    private readonly jobDomainService: JobDomainService,
    private readonly createPlacementHandler: CreatePlacementFromApplicationHandler,
  ) {}

  async execute(
    command: UpdateJobApplicationStatusCommand,
  ): Promise<GetJobApplicationResult> {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(application);

    this.domainService.ensureValidStatusTransition(
      application.status,
      command.status,
    );

    application.changeStatus(command.status, command.updatedBy);
    await this.applicationRepo.save(application);

    if (command.status === JobApplicationStatus.PLACED) {
      const job = this.jobDomainService.ensureExists(
        await this.jobRepo.findById(application.jobId, true),
      );

      await this.createPlacementHandler.execute(
        new CreatePlacementFromApplicationCommand(
          application,
          job,
          command.updatedBy,
        ),
      );
    }

    return this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(application.id),
    );
  }
}
