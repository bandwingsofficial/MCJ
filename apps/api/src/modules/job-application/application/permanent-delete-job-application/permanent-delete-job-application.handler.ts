import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { JobApplicationRepository } from '../../domain/repositories/job-application.repository';
import { JobApplicationDomainService } from '../../domain/services/job-application-domain.service';

import { PermanentDeleteJobApplicationCommand } from './permanent-delete-job-application.command';
import { PermanentDeleteJobApplicationResult } from './permanent-delete-job-application.result';

export class PermanentDeleteJobApplicationHandler {
  constructor(
    private readonly applicationRepo: JobApplicationRepository,
    private readonly domainService: JobApplicationDomainService,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteJobApplicationCommand,
  ): Promise<PermanentDeleteJobApplicationResult> {
    const application = this.domainService.ensureExists(
      await this.applicationRepo.findById(command.id, true),
    );

    this.domainService.ensureDeleted(application);

    const resumeFileId = application.resumeFileId;

    await this.applicationRepo.deletePermanent(application.id);

    if (resumeFileId) {
      await this.uploadDomainService.permanentDelete(resumeFileId);
    }

    return new PermanentDeleteJobApplicationResult(application.id, true);
  }
}
