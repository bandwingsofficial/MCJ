import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { DeleteJobApplicationCommand } from './delete-job-application.command';
import { DeleteJobApplicationResult } from './delete-job-application.result';

export class DeleteJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(
    command: DeleteJobApplicationCommand,
  ): Promise<DeleteJobApplicationResult> {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(application);
    application.softDelete(command.deletedBy);
    await this.applicationRepo.save(application);

    return new DeleteJobApplicationResult(
      application.id,
      true,
      application.deletedAt,
    );
  }
}
