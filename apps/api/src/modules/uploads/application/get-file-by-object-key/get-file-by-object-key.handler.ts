import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { UploadNotFoundException } from '../../domain/errors/upload-not-found.exception';

import { GetFileByObjectKeyQuery } from './get-file-by-object-key.query';
import { GetFileByObjectKeyResult } from './get-file-by-object-key.result';
import { GetFileResult } from '../get-file/get-file.result';

export class GetFileByObjectKeyHandler {
  constructor(private readonly uploadRepo: UploadRepository) {}

  async execute(
    query: GetFileByObjectKeyQuery,
  ): Promise<GetFileByObjectKeyResult> {
    const upload = await this.uploadRepo.findByObjectKey(
      query.objectKey,
      query.includeDeleted,
    );

    if (!upload) {
      throw new UploadNotFoundException(query.objectKey);
    }

    return GetFileResult.fromUpload(upload) as GetFileByObjectKeyResult;
  }
}
