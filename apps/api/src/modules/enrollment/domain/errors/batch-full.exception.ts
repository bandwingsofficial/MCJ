import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class BatchFullException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.BATCH_FULL,
      'Batch is full. No seats are available.',
      400,
    );
  }
}
