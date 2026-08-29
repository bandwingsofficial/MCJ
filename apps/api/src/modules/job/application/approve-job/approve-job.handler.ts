import { JobStatus } from '../../domain/enums/job-status.enum';
import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';

export class ApproveJobCommand {
  constructor(
    public readonly id: string,
    public readonly reviewedBy?: string,
  ) {}
}

/**
 * Accepts a company onboarding submission (PENDING or REJECTED → ACTIVE).
 * Idempotent: if already ACTIVE with a job number, returns the existing job.
 * Reuses an existing jobNumber when present (never creates a second Job row).
 */
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

    // Idempotent accept — same Job, no duplicate number.
    if (job.status === JobStatus.ACTIVE && job.jobNumber) {
      return GetJobResult.fromEntity(job);
    }

    this.domainService.ensureCanApprove(job);

    const jobNumber = job.jobNumber ?? (await this.jobRepo.nextJobNumber());
    job.approve(jobNumber, command.reviewedBy);
    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
