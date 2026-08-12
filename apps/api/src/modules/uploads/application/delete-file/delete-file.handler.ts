import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { DeleteFileCommand } from './delete-file.command';
import { DeleteFileResult } from './delete-file.result';

export class DeleteFileHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: DeleteFileCommand,
  ): Promise<DeleteFileResult> {
    const upload = await this.uploadDomainService.softDelete(
      command.id,
    );

    return new DeleteFileResult(
      upload.id,
      true,
      upload.deletedAt,
    );
  }
}
