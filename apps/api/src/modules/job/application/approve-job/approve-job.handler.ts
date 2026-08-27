import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';

export class ApproveJobCommand {
  constructor(
    public readonly id: string,
    public readonly reviewedBy?: string,
  ) {}
}

export class ApproveJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: ApproveJobCommand): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(job);
    this.domainService.ensurePendingApproval(job);

    const jobNumber = await this.jobRepo.nextJobNumber();
    job.approve(jobNumber, command.reviewedBy);
    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
