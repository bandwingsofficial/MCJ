import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { CourseStatus } from '../../domain/enums/course-status.enum';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseLessonPreviewResult } from '../get-course/get-course.result';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { GetPreviewLessonQuery } from './get-preview-lesson.query';

export class GetPreviewLessonHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    query: GetPreviewLessonQuery,
  ): Promise<CourseLessonPreviewResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(query.courseId),
    );

    if (
      query.onlyActive &&
      course.status !== CourseStatus.ACTIVE
    ) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    const lesson = await this.hierarchyService.getPreviewLesson(
      course.id,
      query.lessonId,
    );

    if (!lesson) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_NOT_PREVIEW,
        'Lesson is not available for preview.',
        404,
      );
    }

    return lesson;
  }
}
