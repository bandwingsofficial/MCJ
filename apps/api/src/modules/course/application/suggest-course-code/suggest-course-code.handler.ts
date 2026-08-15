import type { CourseRepository } from '../../domain/repositories/course.repository';
import { formatCourseCode } from '../../domain/utils/course-code.util';

import { SuggestCourseCodeQuery } from './suggest-course-code.query';
import { SuggestCourseCodeResult } from './suggest-course-code.result';

export class SuggestCourseCodeHandler {
  constructor(private readonly courseRepo: CourseRepository) {}

  async execute(
    _query: SuggestCourseCodeQuery,
  ): Promise<SuggestCourseCodeResult> {
    const maxNumber = await this.courseRepo.getMaxCourseCodeNumber();
    const courseCode = formatCourseCode(maxNumber + 1);

    return new SuggestCourseCodeResult(courseCode);
  }
}
