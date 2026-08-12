import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { JobHasApplicationsException } from '../../domain/errors/job-business.exception';
import { PermanentDeleteJobCommand } from './permanent-delete-job.command';
import { PermanentDeleteJobResult } from './permanent-delete-job.result';

export class PermanentDeleteJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(
    command: PermanentDeleteJobCommand,
  ): Promise<PermanentDeleteJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(job);

    if (await this.jobRepo.hasApplications(job.id)) {
      throw new JobHasApplicationsException();
    }

    await this.jobRepo.deletePermanent(job.id);

    return new PermanentDeleteJobResult(job.id, true);
  }
}
