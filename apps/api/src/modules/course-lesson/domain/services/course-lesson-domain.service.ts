import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseLesson } from '../entities/course-lesson.entity';
import type { CourseLessonRepository } from '../repositories/course-lesson.repository';

@Injectable()
export class CourseLessonDomainService {
  async ensureExists(
    lesson: CourseLesson | null,
  ): Promise<CourseLesson> {
    if (!lesson) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_NOT_FOUND,
        'Course lesson not found',
        404,
      );
    }

    return lesson;
  }

  async ensureSlugIsAvailable(
    courseLessonRepo: CourseLessonRepository,
    moduleId: string,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await courseLessonRepo.findBySlug(
      moduleId,
      slug,
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_ALREADY_EXISTS,
        'Course lesson slug already exists',
        400,
      );
    }
  }
}
