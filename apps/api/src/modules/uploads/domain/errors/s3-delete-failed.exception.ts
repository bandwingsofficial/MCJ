import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class S3DeleteFailedException extends BaseException {
  constructor(objectKey?: string) {
    super(
      ERROR_CODES.S3_DELETE_FAILED,
      'File delete failed',
      500,
      objectKey ? { objectKey } : undefined,
    );
  }
}
