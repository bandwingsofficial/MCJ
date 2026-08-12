import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from './get-job.result';
import { GetJobQuery } from './get-job.query';

export class GetJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(query: GetJobQuery): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(query.id, query.includeDeleted),
    );

    if (query.onlyPublic) {
      this.domainService.ensurePubliclyVisible(job);
    }

    return GetJobResult.fromEntity(job);
  }
}
