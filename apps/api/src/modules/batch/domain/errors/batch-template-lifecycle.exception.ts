import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class BatchTemplateLifecycleBlockedException extends BaseException {
  constructor(message: string) {
    super(ERROR_CODES.BATCH_NOT_SELECTABLE, message, 409);
  }
}
