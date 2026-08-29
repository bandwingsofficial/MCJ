import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';

export class RejectJobCommand {
  constructor(
    public readonly id: string,
    public readonly reason?: string | null,
    public readonly reviewedBy?: string,
  ) {}
}

export class RejectJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: RejectJobCommand): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureNotDeleted(job);
    this.domainService.ensureCanReject(job);

    job.reject(command.reason ?? null, command.reviewedBy);
    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
