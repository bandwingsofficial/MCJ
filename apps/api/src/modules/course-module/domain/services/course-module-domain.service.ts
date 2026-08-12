import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseModule } from '../entities/course-module.entity';
import type { CourseModuleRepository } from '../repositories/course-module.repository';

@Injectable()
export class CourseModuleDomainService {
  async ensureExists(
    module: CourseModule | null,
  ): Promise<CourseModule> {
    if (!module) {
      throw new BaseException(
        ERROR_CODES.COURSE_MODULE_NOT_FOUND,
        'Course module not found',
        404,
      );
    }

    return module;
  }

  async ensureSlugIsAvailable(
    courseModuleRepo: CourseModuleRepository,
    courseId: string,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await courseModuleRepo.findBySlug(
      courseId,
      slug,
      true,
    );

    if (existing && existing.id !== excludeId) {
      throw new BaseException(
        ERROR_CODES.COURSE_MODULE_ALREADY_EXISTS,
        'Course module slug already exists',
        400,
      );
    }
  }
}
