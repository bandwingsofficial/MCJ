import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseNotFoundException extends BaseException {
  constructor(courseId: string) {
    super(
      ERROR_CODES.COURSE_NOT_FOUND,
      `Course not found: ${courseId}`,
      404,
    );
  }
}
