import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { JobRepository } from '../../domain/repositories/job.repository';
import { JobDomainService } from '../../domain/services/job-domain.service';
import { PermanentDeleteJobCommand } from './permanent-delete-job.command';
import { PermanentDeleteJobResult } from './permanent-delete-job.result';

export class PermanentDeleteJobHandler {
  constructor(
    private readonly jobRepo: JobRepository,
    private readonly domainService: JobDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteJobCommand,
  ): Promise<PermanentDeleteJobResult> {
    const job = this.domainService.ensureExists(
      await this.jobRepo.findById(command.id, true),
    );

    this.domainService.ensureEligibleForPermanentDelete(job);

    const resumeFileIds = await this.jobRepo.deletePermanent(job.id);

    for (const resumeFileId of resumeFileIds) {
      await this.uploadDomainService.permanentDelete(resumeFileId);
    }

    return new PermanentDeleteJobResult(job.id, true);
  }
}
