import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class InvalidMovePositionException extends BaseException {
  constructor(message = 'Invalid move position') {
    super(
      ERROR_CODES.INVALID_MOVE_POSITION,
      message,
      400,
    );
  }
}
