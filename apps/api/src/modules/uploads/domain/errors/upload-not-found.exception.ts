import { ERROR_CODES } from '@common/constants/error-codes';
import { NotFoundException } from '@common/exceptions/not-found.exception';

export class UploadNotFoundException extends NotFoundException {
  constructor(uploadId?: string) {
    super(
      ERROR_CODES.UPLOAD_NOT_FOUND,
      'Upload not found',
      uploadId ? { uploadId } : undefined,
    );
  }
}
