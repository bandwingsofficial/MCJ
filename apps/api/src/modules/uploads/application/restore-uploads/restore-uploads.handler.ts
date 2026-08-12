import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { RestoreUploadsCommand } from './restore-uploads.command';
import { RestoreUploadsResult } from './restore-uploads.result';

export class RestoreUploadsHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: RestoreUploadsCommand,
  ): Promise<RestoreUploadsResult> {
    await this.uploadDomainService.restoreMany(
      command.ids,
      command.updatedBy,
    );

    return new RestoreUploadsResult(
      command.ids,
      command.ids.length,
    );
  }
}
