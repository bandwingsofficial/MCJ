import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { Slug } from '@common/value-objects/slug.vo';

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

  /**
   * Slug uniqueness is scoped to siblings: same moduleId + parentLessonId.
   * Root lessons (parentLessonId null) do not collide with child video rows.
   */
  async ensureSlugIsAvailable(
    courseLessonRepo: CourseLessonRepository,
    moduleId: string,
    slug: string,
    parentLessonId: string | null,
    excludeId?: string,
  ): Promise<void> {
    const existing = await courseLessonRepo.findBySlug(
      moduleId,
      slug,
      parentLessonId,
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

  async resolveAvailableSlug(
    courseLessonRepo: CourseLessonRepository,
    moduleId: string,
    parentLessonId: string | null,
    title: string,
    excludeId?: string,
    batchId?: string | null,
  ): Promise<string> {
    const base = Slug.fromTitle(title).getValue();
    let slug = base;
    let suffix = 2;

    while (true) {
      const existing = await courseLessonRepo.findBySlug(
        moduleId,
        slug,
        parentLessonId,
        true,
        batchId,
      );

      if (!existing || existing.id === excludeId) {
        return slug;
      }

      slug = `${base}-${suffix}`;
      suffix += 1;
    }
  }
}
