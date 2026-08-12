import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { RestoreJobApplicationCommand } from './restore-job-application.command';

export class RestoreJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(
    command: RestoreJobApplicationCommand,
  ): Promise<GetJobApplicationResult> {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(application);
    application.restore(command.updatedBy);
    await this.applicationRepo.save(application);

    return this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(application.id),
    );
  }
}
