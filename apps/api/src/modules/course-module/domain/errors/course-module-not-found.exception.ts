import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseModuleNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_MODULE_NOT_FOUND,
      'Course module not found',
      404,
    );
  }
}
