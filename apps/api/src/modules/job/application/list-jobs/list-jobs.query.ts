import { JobSource } from '../../domain/enums/job-source.enum';
import { JobStatus } from '../../domain/enums/job-status.enum';

export class ListJobsQuery {
  constructor(
    public readonly status?: JobStatus,
    public readonly employmentType?: string,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly onlyActive = false,
    public readonly onlyPublic = false,
    public readonly isActive?: boolean,
    public readonly onlyDeleted = false,
    public readonly skip?: number,
    public readonly take?: number,
    public readonly source?: JobSource,
    public readonly excludeStatuses?: JobStatus[],
  ) {}
}
