import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseLessonNotFoundException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_LESSON_NOT_FOUND,
      'Course lesson not found',
      404,
    );
  }
}
