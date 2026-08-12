import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseResourceNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_RESOURCE_NOT_FOUND,
      'Course resource not found',
      404,
    );
  }
}
