import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class InvalidFileException extends BaseException {
  constructor(message = 'Invalid file') {
    super(ERROR_CODES.INVALID_FILE, message, 400);
  }
}
