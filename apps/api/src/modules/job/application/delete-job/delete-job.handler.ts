import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { DeleteJobCommand } from './delete-job.command';
import { DeleteJobResult } from './delete-job.result';

export class DeleteJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: DeleteJobCommand): Promise<DeleteJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(job);

    job.softDelete(command.deletedBy);
    await this.jobRepo.save(job);

    return new DeleteJobResult(job.id, true, job.deletedAt);
  }
}
