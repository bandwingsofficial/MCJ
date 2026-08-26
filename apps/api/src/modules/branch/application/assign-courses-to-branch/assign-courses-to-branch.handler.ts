import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseStatus } from '@/modules/course/domain/enums/course-status.enum';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { AssignCoursesToBranchCommand } from './assign-courses-to-branch.command';
import { AssignCoursesToBranchResult } from './assign-courses-to-branch.result';

export class AssignCoursesToBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: AssignCoursesToBranchCommand,
  ): Promise<AssignCoursesToBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const uniqueIds = [...new Set(command.courseIds.filter(Boolean))];

    if (uniqueIds.length === 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Select at least one course to assign',
        400,
      );
    }

    const courses = await this.branchRepo.findCoursesByIds(uniqueIds);
    const coursesById = new Map(courses.map((course) => [course.id, course]));

    for (const courseId of uniqueIds) {
      const course = coursesById.get(courseId);

      if (!course || course.isDeleted) {
        throw new BaseException(
          ERROR_CODES.COURSE_NOT_FOUND,
          'Course not found',
          404,
        );
      }

      if (course.status !== CourseStatus.ACTIVE) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Only active courses can be assigned to a branch',
          400,
        );
      }
    }

    const assignedCount = await this.branchRepo.assignCoursesToBranch(
      command.branchId,
      uniqueIds,
    );

    return new AssignCoursesToBranchResult(
      command.branchId,
      assignedCount,
      uniqueIds,
    );
  }
}
