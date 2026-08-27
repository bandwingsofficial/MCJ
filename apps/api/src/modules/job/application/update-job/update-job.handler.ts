import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { GetJobResult } from '../get-job/get-job.result';
import { UpdateJobCommand } from './update-job.command';

export class UpdateJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
  ) {}

  async execute(command: UpdateJobCommand): Promise<GetJobResult> {
    const input = command.input;
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(input.id, true),
    );

    this.domainService.ensureNotDeleted(job);

    if (input.title) {
      const slug = await this.domainService.resolveAvailableSlug(
        this.jobRepo,
        input.title,
        job.id,
      );
      job.update({
        ...input,
        slug: input.slug ?? slug,
      });
    } else {
      job.update(input);
    }

    await this.jobRepo.save(job);

    return GetJobResult.fromEntity(job);
  }
}
