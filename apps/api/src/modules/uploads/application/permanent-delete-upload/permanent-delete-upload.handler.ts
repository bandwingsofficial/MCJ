import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { PermanentDeleteUploadCommand } from './permanent-delete-upload.command';
import { PermanentDeleteUploadResult } from './permanent-delete-upload.result';

export class PermanentDeleteUploadHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: PermanentDeleteUploadCommand,
  ): Promise<PermanentDeleteUploadResult> {
    const upload = await this.uploadDomainService.permanentDelete(
      command.id,
    );

    return new PermanentDeleteUploadResult(upload.id, true);
  }
}
