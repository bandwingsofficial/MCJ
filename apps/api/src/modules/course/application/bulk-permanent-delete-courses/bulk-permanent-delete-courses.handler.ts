import { Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';

import { ValidationError } from '../errors/validation.error';
import type { BulkCourseItemResult } from '../shared/bulk-course-operation.result';
import { parseBulkCourseIds } from '../shared/parse-bulk-course-ids';

import { BulkPermanentDeleteCoursesCommand } from './bulk-permanent-delete-courses.command';
import { BulkPermanentDeleteCoursesResult } from './bulk-permanent-delete-courses.result';

function isForeignKeyRestrictError(error: unknown): boolean {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2003'
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('foreign key constraint') ||
    message.includes('violates restrict') ||
    message.includes('23001') ||
    message.includes('23503')
  );
}

export class BulkPermanentDeleteCoursesHandler {
  private readonly logger = new Logger(
    BulkPermanentDeleteCoursesHandler.name,
  );

  constructor(
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(
    command: BulkPermanentDeleteCoursesCommand,
  ): Promise<BulkPermanentDeleteCoursesResult> {
    try {
      this.logger.log('Bulk permanent delete courses request received');

      const courseIds = parseBulkCourseIds(command.courseIds);
      const itemResults: BulkCourseItemResult[] = [];

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

        if (!course.isDeleted) {
          itemResults.push({
            courseId,
            success: false,
            message:
              'Only archived courses can be permanently deleted',
          });
          continue;
        }

        const displayOrder = course.displayOrder;

        try {
          await this.courseRepo.deletePermanent(course.id);

          if (displayOrder != null) {
            await this.courseRepo.closeDisplayOrderGap(displayOrder);
          }

          itemResults.push({
            courseId,
            success: true,
            message: 'Course permanently deleted successfully',
          });

          this.logger.log(`Course permanently deleted: ${course.id}`);
        } catch (error) {
          if (isForeignKeyRestrictError(error)) {
            itemResults.push({
              courseId,
              success: false,
              message:
                'Cannot permanently delete this course because it is still referenced by other records.',
            });
            continue;
          }

          itemResults.push({
            courseId,
            success: false,
            message: 'Unable to permanently delete course',
          });
        }
      }

      return BulkPermanentDeleteCoursesResult.fromItemResults(
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
