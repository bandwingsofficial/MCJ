import { BaseException } from '@common/exceptions/base.exception';
import { ERROR_CODES } from '@common/constants/error-codes';

import type { Upload } from '../../domain/entities/upload.entity';
import type { UploadRepository } from '../../domain/repositories/upload.repository';
import { UploadNotFoundException } from '../../domain/errors/upload-not-found.exception';

import { GetFileQuery } from './get-file.query';
import { GetFileResult } from './get-file.result';

export class GetFileHandler {
  constructor(
    private readonly uploadRepo: UploadRepository,
  ) {}

  async execute(query: GetFileQuery): Promise<GetFileResult> {
    if (!query.id && !query.objectKey && !query.url) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Either id, objectKey, or url is required',
        400,
      );
    }

    let upload: Upload | null = null;

    if (query.id) {
      upload = await this.uploadRepo.findById(
        query.id,
        query.includeDeleted,
      );
    } else if (query.objectKey) {
      upload = await this.uploadRepo.findByObjectKey(
        query.objectKey,
        query.includeDeleted,
      );
    } else if (query.url) {
      upload = await this.uploadRepo.findByUrl(
        query.url,
        query.includeDeleted,
      );
    }

    if (!upload) {
      throw new UploadNotFoundException(
        query.id ?? query.objectKey ?? query.url,
      );
    }

    return GetFileResult.fromUpload(upload);
  }
}
