import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';
import { UpdateJobActivationCommand } from './update-job-activation.command';

export class UpdateJobActivationHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(
    command: UpdateJobActivationCommand,
  ): Promise<GetJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id),
    );

    this.domainService.ensureNotDeleted(job);

    if (command.activate) {
      job.activate(command.updatedBy);
    } else {
      job.deactivate(command.updatedBy);
    }

    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
