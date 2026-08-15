import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { Course } from '../../domain/entities/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseStatus } from '../../domain/enums/course-status.enum';

import { ValidationError } from '../errors/validation.error';
import type { BulkCourseItemResult } from '../shared/bulk-course-operation.result';
import { parseBulkCourseIds } from '../shared/parse-bulk-course-ids';

import { BulkUpdateCourseStatusCommand } from './bulk-update-course-status.command';
import { BulkUpdateCourseStatusResult } from './bulk-update-course-status.result';

export class BulkUpdateCourseStatusHandler {
  private readonly logger = new Logger(
    BulkUpdateCourseStatusHandler.name,
  );

  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(
    command: BulkUpdateCourseStatusCommand,
  ): Promise<BulkUpdateCourseStatusResult> {
    try {
      this.logger.log('Bulk update course status request received');

      const courseIds = parseBulkCourseIds(command.courseIds);

      if (
        command.status !== CourseStatus.ACTIVE &&
        command.status !== CourseStatus.INACTIVE
      ) {
        throw new ValidationError(
          'Only ACTIVE and INACTIVE statuses are supported',
          ERROR_CODES.VALIDATION_ERROR,
        );
      }

      const itemResults: BulkCourseItemResult[] = [];
      const coursesToUpdate: Course[] = [];

      for (const courseId of courseIds) {
        const course =
          await this.courseRepo.findByIdIncludingDeleted(courseId);

        if (!course) {
          itemResults.push({
            courseId,
            success: false,
            message: 'Course not found',
          });
          continue;
        }

        if (course.isDeleted) {
          itemResults.push({
            courseId,
            success: false,
            message:
              'Archived courses cannot be activated or deactivated',
          });
          continue;
        }

        if (command.status === course.status) {
          itemResults.push({
            courseId,
            success: true,
            message: `Course is already ${command.status.toLowerCase()}`,
            status: course.status,
          });
          continue;
        }

        coursesToUpdate.push(course);
      }

      if (command.status === CourseStatus.INACTIVE) {
        coursesToUpdate.sort((left, right) => {
          const leftOrder = left.displayOrder ?? -1;
          const rightOrder = right.displayOrder ?? -1;
          return rightOrder - leftOrder;
        });
      }

      for (const course of coursesToUpdate) {
        try {
          if (command.status === CourseStatus.ACTIVE) {
            const nextDisplayOrder =
              (await this.courseRepo.getMaxActiveDisplayOrder()) + 1;

            course.changeDisplayOrder(nextDisplayOrder);
            course.activate();
          } else {
            if (course.displayOrder != null) {
              await this.courseRepo.closeDisplayOrderGap(
                course.displayOrder,
              );
            }

            course.changeDisplayOrder(null);
            course.deactivate();
          }

          await this.courseRepo.save(course);

          itemResults.push({
            courseId: course.id,
            success: true,
            message:
              command.status === CourseStatus.ACTIVE
                ? 'Course activated successfully'
                : 'Course deactivated successfully',
            status: course.status,
          });

          this.logger.log(`Course status updated: ${course.id}`);
        } catch {
          itemResults.push({
            courseId: course.id,
            success: false,
            message: 'Unable to update course status',
          });
        }
      }

      return BulkUpdateCourseStatusResult.create(
        command.status,
        courseIds.length,
        itemResults,
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
