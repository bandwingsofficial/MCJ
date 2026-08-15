import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';

import { ValidationError } from '../errors/validation.error';

import { GetCourseSummaryQuery } from './get-course-summary.query';
import { GetCourseSummaryResult } from './get-course-summary.result';

export class GetCourseSummaryHandler {
  private readonly logger = new Logger(GetCourseSummaryHandler.name);

  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    query: GetCourseSummaryQuery,
  ): Promise<GetCourseSummaryResult> {
    try {
      this.logger.log('Get course summary request received');

      const course =
        await this.courseRepo.findByIdIncludingDeleted(
          query.courseId,
        );

      const existingCourse =
        await this.domainService.ensureExists(course);

      const counts =
        await this.courseRepo.getManagementCounts(existingCourse.id);

      return new GetCourseSummaryResult(
        existingCourse.id,
        counts.batches,
        counts.students,
        counts.instructors,
        counts.branches,
        counts.modules,
        counts.lessons,
        counts.quizzes,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code ?? ERROR_CODES.VALIDATION_ERROR,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
