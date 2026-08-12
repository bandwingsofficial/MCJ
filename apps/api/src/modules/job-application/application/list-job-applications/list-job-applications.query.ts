import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

export class ListJobApplicationsQuery {
  constructor(
    public readonly jobId?: string,
    public readonly studentId?: string,
    public readonly status?: JobApplicationStatus,
    public readonly search?: string,
    public readonly includeDeleted?: boolean,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
