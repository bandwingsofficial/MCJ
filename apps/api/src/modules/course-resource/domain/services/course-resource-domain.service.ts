import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseResource } from '../entities/course-resource.entity';

@Injectable()
export class CourseResourceDomainService {
  async ensureExists(
    resource: CourseResource | null,
  ): Promise<CourseResource> {
    if (!resource) {
      throw new BaseException(
        ERROR_CODES.COURSE_RESOURCE_NOT_FOUND,
        'Course resource not found',
        404,
      );
    }

    return resource;
  }
}
