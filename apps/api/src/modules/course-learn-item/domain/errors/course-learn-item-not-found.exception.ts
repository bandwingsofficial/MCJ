import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseLearnItemNotFoundException extends BaseException {
  constructor(message = 'Course learn item not found') {
    super(ERROR_CODES.COURSE_LEARN_ITEM_NOT_FOUND, message, 404);
  }
}
