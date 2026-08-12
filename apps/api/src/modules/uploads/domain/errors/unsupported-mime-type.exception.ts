import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class UnsupportedMimeTypeException extends BaseException {
  constructor(mimeType?: string) {
    super(
      ERROR_CODES.UNSUPPORTED_MIME_TYPE,
      'Unsupported file type',
      400,
      mimeType ? { mimeType } : undefined,
    );
  }
}
