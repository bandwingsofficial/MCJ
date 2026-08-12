import type { Job } from '@modules/job/domain/entities/job.entity';
import type { JobApplication } from '@modules/job-application/domain/entities/job-application.entity';

export class CreatePlacementFromApplicationCommand {
  constructor(
    public readonly application: JobApplication,
    public readonly job: Job,
    public readonly createdBy?: string,
  ) {}
}
