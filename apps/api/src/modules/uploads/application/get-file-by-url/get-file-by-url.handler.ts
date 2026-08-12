import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { UploadNotFoundException } from '../../domain/errors/upload-not-found.exception';

import { GetFileByUrlQuery } from './get-file-by-url.query';
import { GetFileByUrlResult } from './get-file-by-url.result';
import { GetFileResult } from '../get-file/get-file.result';

export class GetFileByUrlHandler {
  constructor(private readonly uploadRepo: UploadRepository) {}

  async execute(query: GetFileByUrlQuery): Promise<GetFileByUrlResult> {
    const upload = await this.uploadRepo.findByUrl(
      query.url,
      query.includeDeleted,
    );

    if (!upload) {
      throw new UploadNotFoundException(query.url);
    }

    return GetFileResult.fromUpload(upload) as GetFileByUrlResult;
  }
}
