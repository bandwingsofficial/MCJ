import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseStatus } from '../../domain/enums/course-status.enum';

import { ValidationError } from '../errors/validation.error';

import { ReorderCoursesCommand } from './reorder-courses.command';
import { ReorderCoursesResult } from './reorder-courses.result';

export class ReorderCoursesHandler {
  private readonly logger = new Logger(ReorderCoursesHandler.name);

  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    command: ReorderCoursesCommand,
  ): Promise<ReorderCoursesResult> {
    try {
      this.logger.log('Reorder course request received');

      const course = await this.domainService.ensureExists(
        await this.courseRepo.findById(command.courseId),
      );

      if (
        course.isDeleted ||
        course.status !== CourseStatus.ACTIVE ||
        course.displayOrder == null
      ) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Deleted, inactive, or unordered courses cannot be reordered',
          400,
        );
      }

      if (command.newDisplayOrder < 1) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order must be at least 1',
          400,
        );
      }

      const maxOrder = await this.courseRepo.getMaxDisplayOrder();

      if (command.newDisplayOrder > maxOrder) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Display order is out of range',
          400,
        );
      }

      if (course.displayOrder === command.newDisplayOrder) {
        return new ReorderCoursesResult(
          course.id,
          course.displayOrder,
        );
      }

      await this.courseRepo.moveDisplayOrder(
        course.id,
        course.displayOrder,
        command.newDisplayOrder,
      );

      return new ReorderCoursesResult(
        course.id,
        command.newDisplayOrder,
      );
    } catch (error) {
      if (error instanceof BaseException) {
        throw new ValidationError(
          error.message,
          error.code,
          error.metadata,
          error.statusCode,
        );
      }

      throw error;
    }
  }
}
