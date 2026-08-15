import { Logger } from '@nestjs/common';

import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { ValidationError } from '../errors/validation.error';
import type { BulkCourseItemResult } from '../shared/bulk-course-operation.result';
import { parseBulkCourseIds } from '../shared/parse-bulk-course-ids';

import { BulkRestoreCoursesCommand } from './bulk-restore-courses.command';
import { BulkRestoreCoursesResult } from './bulk-restore-courses.result';

export class BulkRestoreCoursesHandler {
  private readonly logger = new Logger(BulkRestoreCoursesHandler.name);

  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    command: BulkRestoreCoursesCommand,
  ): Promise<BulkRestoreCoursesResult> {
    try {
      this.logger.log('Bulk restore courses request received');

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
            message: 'Course is already active',
          });
          continue;
        }

        try {
          const nextDisplayOrder =
            (await this.courseRepo.getMaxDisplayOrder()) + 1;

          course.restore();
          course.changeDisplayOrder(nextDisplayOrder);

          await this.courseRepo.save(course);

          await this.hierarchyService.restoreDescendants(course.id);

          itemResults.push({
            courseId: course.id,
            success: true,
            message: 'Course restored successfully',
            status: course.status,
          });

          this.logger.log(`Course restored: ${course.id}`);
        } catch {
          itemResults.push({
            courseId,
            success: false,
            message: 'Unable to restore course',
          });
        }
      }

      return BulkRestoreCoursesResult.fromItemResults(
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
