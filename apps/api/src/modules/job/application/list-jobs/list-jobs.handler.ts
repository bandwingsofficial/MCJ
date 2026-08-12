import type { JobRepository } from '../../domain/repositories/job.repository';
import { GetJobResult } from '../get-job/get-job.result';
import { ListJobsQuery } from './list-jobs.query';

export class ListJobsHandler {
  constructor(private readonly jobRepo: JobRepository) {}

  async execute(query: ListJobsQuery): Promise<GetJobResult[]> {
    const jobs = await this.jobRepo.findAll({
      status: query.status,
      employmentType: query.employmentType,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      onlyPublic: query.onlyPublic,
      skip: query.skip,
      take: query.take,
    });

    return jobs.map((job) => GetJobResult.fromEntity(job));
  }
}
