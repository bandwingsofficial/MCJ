import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BATCH_NOT_SELECTABLE_MESSAGE } from '../utils/batch-selection.util';

export class BatchNotSelectableException extends BaseException {
  constructor(message: string = BATCH_NOT_SELECTABLE_MESSAGE) {
    super(ERROR_CODES.BATCH_NOT_SELECTABLE, message, 409);
  }
}
