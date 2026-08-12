import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseAccessDeniedException extends BaseException {
  constructor(message = 'Course access denied.') {
    super(ERROR_CODES.COURSE_ACCESS_DENIED, message, 403);
  }
}

export class CourseLessonNotPreviewException extends BaseException {
  constructor() {
    super(
      ERROR_CODES.COURSE_LESSON_NOT_PREVIEW,
      'Lesson is not available for preview.',
      404,
    );
  }
}
