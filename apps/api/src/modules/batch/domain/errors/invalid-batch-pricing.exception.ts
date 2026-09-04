import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class InvalidBatchPricingException extends BaseException {
  constructor(
    message = 'Invalid batch pricing',
  ) {
    super(
      ERROR_CODES.INVALID_BATCH_PRICING,
      message,
      400,
    );
  }
}
