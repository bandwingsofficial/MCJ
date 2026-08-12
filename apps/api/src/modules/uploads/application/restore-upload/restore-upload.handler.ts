import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { RestoreUploadCommand } from './restore-upload.command';
import { RestoreUploadResult } from './restore-upload.result';

export class RestoreUploadHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: RestoreUploadCommand,
  ): Promise<RestoreUploadResult> {
    const upload = await this.uploadDomainService.restore(
      command.id,
      command.updatedBy,
    );

    return new RestoreUploadResult(upload.id, true);
  }
}
