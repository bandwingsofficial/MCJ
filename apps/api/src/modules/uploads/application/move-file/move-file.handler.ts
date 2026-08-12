import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { MoveFileCommand } from './move-file.command';
import { MoveFileResult } from './move-file.result';
import { UploadFileResult } from '../upload-file/upload-file.result';

export class MoveFileHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(command: MoveFileCommand): Promise<MoveFileResult> {
    const upload = await this.uploadDomainService.attachToEntity({
      uploadId: command.id,
      folder: command.folder,
      entityId: command.entityId,
      fileName: command.fileName,
    });

    return UploadFileResult.fromUpload(upload) as MoveFileResult;
  }
}
