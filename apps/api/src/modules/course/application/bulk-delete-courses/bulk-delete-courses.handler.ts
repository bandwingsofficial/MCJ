import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { Course } from '../../domain/entities/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { ValidationError } from '../errors/validation.error';
import type { BulkCourseItemResult } from '../shared/bulk-course-operation.result';
import { parseBulkCourseIds } from '../shared/parse-bulk-course-ids';

import { BulkDeleteCoursesCommand } from './bulk-delete-courses.command';
import { BulkDeleteCoursesResult } from './bulk-delete-courses.result';

export class BulkDeleteCoursesHandler {
  private readonly logger = new Logger(BulkDeleteCoursesHandler.name);

  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    command: BulkDeleteCoursesCommand,
  ): Promise<BulkDeleteCoursesResult> {
    try {
      this.logger.log('Bulk delete courses request received');

      const courseIds = parseBulkCourseIds(command.courseIds);
      const itemResults: BulkCourseItemResult[] = [];
      const coursesToDelete: Course[] = [];

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
            success: true,
            message: 'Course is already archived',
          });
          continue;
        }

        coursesToDelete.push(course);
      }

      coursesToDelete.sort((left, right) => {
        const leftOrder = left.displayOrder ?? -1;
        const rightOrder = right.displayOrder ?? -1;
        return rightOrder - leftOrder;
      });

      for (const course of coursesToDelete) {
        try {
          const deletedDisplayOrder = course.displayOrder;

          course.softDelete();
          await this.courseRepo.save(course);

          await this.hierarchyService.softDeleteDescendants(course.id);

          if (deletedDisplayOrder != null) {
            await this.courseRepo.closeDisplayOrderGap(
              deletedDisplayOrder,
            );
          }

          itemResults.push({
            courseId: course.id,
            success: true,
            message: 'Course archived successfully',
          });

          this.logger.log(`Course soft deleted: ${course.id}`);
        } catch {
          itemResults.push({
            courseId: course.id,
            success: false,
            message: 'Unable to archive course',
          });
        }
      }

      return BulkDeleteCoursesResult.fromItemResults(
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
