import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class FileTooLargeException extends BaseException {
  constructor(maxSizeMb: number) {
    super(
      ERROR_CODES.FILE_TOO_LARGE,
      `File size must be less than ${maxSizeMb}MB`,
      400,
      { maxSizeMb },
    );
  }
}
