import { UploadDomainService } from '../../domain/services/upload-domain.service';

import { DeleteFilesCommand } from './delete-files.command';
import { DeleteFilesResult } from './delete-files.result';

export class DeleteFilesHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(
    command: DeleteFilesCommand,
  ): Promise<DeleteFilesResult> {
    await this.uploadDomainService.softDeleteMany(command.ids);

    const results: DeleteFilesResult['results'] = command.ids.map(
      (id) => ({
        id,
        deleted: true,
        deletedAt: new Date(),
      }),
    );

    return new DeleteFilesResult(results);
  }
}
