import { JobApplicationStatus } from '../../domain/enums/job-application-status.enum';

export class UpdateJobApplicationStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: JobApplicationStatus,
    public readonly updatedBy?: string,
  ) {}
}
