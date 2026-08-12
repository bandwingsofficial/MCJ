import { JobStatus } from '../../domain/enums/job-status.enum';

export class ListJobsQuery {
  constructor(
    public readonly status?: JobStatus,
    public readonly employmentType?: string,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly onlyPublic = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
