import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';
import { RestoreJobCommand } from './restore-job.command';

export class RestoreJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: RestoreJobCommand): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(job);
    job.restore(command.updatedBy);
    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
