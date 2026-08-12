import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class FileAlreadyDeletedException extends BaseException {
  constructor(uploadId?: string) {
    super(
      ERROR_CODES.FILE_ALREADY_DELETED,
      'File has already been deleted',
      400,
      uploadId ? { uploadId } : undefined,
    );
  }
}
