import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { ListJobApplicationsQuery } from './list-job-applications.query';

export class ListJobApplicationsResult {
  constructor(
    public readonly items: GetJobApplicationResult[],
    public readonly total: number,
  ) {}
}

export class ListJobApplicationsHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
  ) {}

  async execute(
    query: ListJobApplicationsQuery,
  ): Promise<ListJobApplicationsResult> {
    const filters = {
      jobId: query.jobId,
      studentId: query.studentId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    };

    const [items, total] = await Promise.all([
      this.applicationRepo.findDetails(filters),
      this.applicationRepo.count({
        ...filters,
        skip: undefined,
        take: undefined,
      }),
    ]);

    return new ListJobApplicationsResult(items, total);
  }
}
