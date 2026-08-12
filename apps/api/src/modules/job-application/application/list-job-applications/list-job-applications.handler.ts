import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { GetJobApplicationResult } from '../get-job-application/get-job-application.result';
import { ListJobApplicationsQuery } from './list-job-applications.query';

export class ListJobApplicationsHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
  ) {}

  async execute(
    query: ListJobApplicationsQuery,
  ): Promise<GetJobApplicationResult[]> {
    return this.applicationRepo.findDetails({
      jobId: query.jobId,
      studentId: query.studentId,
      status: query.status,
      search: query.search,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    });
  }
}
