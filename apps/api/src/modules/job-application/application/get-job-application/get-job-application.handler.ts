import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';
import { GetJobApplicationResult } from './get-job-application.result';
import { GetJobApplicationQuery } from './get-job-application.query';

export class GetJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
  ) {}

  async execute(
    query: GetJobApplicationQuery,
  ): Promise<GetJobApplicationResult> {
    return this.domainService.ensureDetailExists(
      await this.applicationRepo.findDetailById(
        query.id,
        query.includeDeleted,
      ),
    );
  }
}
