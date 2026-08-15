import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';

import type { Course } from '../entities/course.entity';
import type { CourseRepository } from '../repositories/course.repository';
import { CategoryNotFoundException } from '../errors/category-not-found.exception';
import { formatCourseCode } from '../utils/course-code.util';

@Injectable()
export class CourseDomainService {
  async ensureExists(course: Course | null): Promise<Course> {
    if (!course) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    return course;
  }

  async ensureSlugIsAvailable(
    courseRepo: CourseRepository,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await courseRepo.findBySlug(
      slug,
      true,
    );

    if (
      existing &&
      existing.id !== excludeId
    ) {
      throw new BaseException(
        ERROR_CODES.COURSE_ALREADY_EXISTS,
        'Course slug already exists',
        400,
      );
    }
  }

  async ensureCategoryExists(
    categoryRepo: CategoryRepository,
    categoryId: string,
  ): Promise<void> {
    const category =
      await categoryRepo.findById(categoryId);

    if (!category) {
      throw new CategoryNotFoundException();
    }
  }

  async generateUniqueCourseCode(
    courseRepo: CourseRepository,
  ): Promise<string> {
    const maxNumber = await courseRepo.getMaxCourseCodeNumber();

    for (let offset = 1; offset <= 50; offset++) {
      const candidate = formatCourseCode(maxNumber + offset);
      const exists = await courseRepo.existsByCourseCode(candidate);

      if (!exists) {
        return candidate;
      }
    }

    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Unable to generate a unique course code',
      500,
    );
  }
}