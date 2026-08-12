import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { CourseStatus } from '../../domain/enums/course-status.enum';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseModulePreviewResult } from '../get-course/get-course.result';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { GetPublicCourseModulesQuery } from './get-public-course-modules.query';

export class GetPublicCourseModulesHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    query: GetPublicCourseModulesQuery,
  ): Promise<CourseModulePreviewResult[]> {
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

    return this.hierarchyService.getPreviewTree(course.id);
  }
}
