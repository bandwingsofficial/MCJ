import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class PaymentNotFoundException extends BaseException {
  constructor() {
    super(ERROR_CODES.PAYMENT_NOT_FOUND, 'Payment not found.', 404);
  }
}
