import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { JobStatus } from '../../domain/enums/job-status.enum';
import { JobNotFoundException } from '../../domain/errors/job-business.exception';
import { GetJobResult } from '../get-job/get-job.result';
import { GetJobBySlugQuery } from './get-job-by-slug.query';

export class GetJobBySlugHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(query: GetJobBySlugQuery): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findBySlug(query.slug),
    );

    this.domainService.ensureNotDeleted(job);

    if (
      job.status === JobStatus.PENDING_APPROVAL ||
      job.status === JobStatus.REJECTED ||
      job.status === JobStatus.DRAFT
    ) {
      throw new JobNotFoundException();
    }

    if (query.onlyPublic) {
      this.domainService.ensurePubliclyVisible(job);
    }

    return GetJobResult.fromEntity(job);
  }
}
