import type { JobRepository } from '../../domain/repositories/job.repository';
import { GetJobResult } from '../get-job/get-job.result';
import { ListJobsQuery } from './list-jobs.query';

export class ListJobsPageResult {
  constructor(
    public readonly items: GetJobResult[],
    public readonly total: number,
    public readonly skip: number,
    public readonly take: number | null,
  ) {}
}

export class ListJobsHandler {
  constructor(private readonly jobRepo: JobRepository) {}

  async execute(query: ListJobsQuery): Promise<ListJobsPageResult> {
    const filters = {
      status: query.status,
      employmentType: query.employmentType,
      search: query.search,
      includeDeleted: query.includeDeleted,
      onlyActive: query.onlyActive,
      onlyPublic: query.onlyPublic,
      isActive: query.isActive,
      onlyDeleted: query.onlyDeleted,
      source: query.source,
      excludeStatuses: query.excludeStatuses,
      includeStatuses: query.includeStatuses,
      skip: query.skip,
      take: query.take,
    };

    const [jobs, total] = await Promise.all([
      this.jobRepo.findAll(filters),
      this.jobRepo.count({
        status: filters.status,
        employmentType: filters.employmentType,
        search: filters.search,
        includeDeleted: filters.includeDeleted,
        onlyActive: filters.onlyActive,
        onlyPublic: filters.onlyPublic,
        isActive: filters.isActive,
        onlyDeleted: filters.onlyDeleted,
        source: filters.source,
        excludeStatuses: filters.excludeStatuses,
        includeStatuses: filters.includeStatuses,
      }),
    ]);

    return new ListJobsPageResult(
      jobs.map((job) => GetJobResult.fromEntity(job)),
      total,
      query.skip ?? 0,
      query.take ?? null,
    );
  }
}
