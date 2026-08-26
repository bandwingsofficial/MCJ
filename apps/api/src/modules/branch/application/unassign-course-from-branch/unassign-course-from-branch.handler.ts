import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { BranchNotFoundException } from '../../domain/errors/branch-not-found.exception';
import type { BranchRepository } from '../../domain/repositories/branch.repository';

import { UnassignCourseFromBranchCommand } from './unassign-course-from-branch.command';
import { UnassignCourseFromBranchResult } from './unassign-course-from-branch.result';

export class UnassignCourseFromBranchHandler {
  constructor(private readonly branchRepo: BranchRepository) {}

  async execute(
    command: UnassignCourseFromBranchCommand,
  ): Promise<UnassignCourseFromBranchResult> {
    const branch = await this.branchRepo.findById(command.branchId);

    if (!branch) {
      throw new BranchNotFoundException(command.branchId);
    }

    const [course] = await this.branchRepo.findCoursesByIds([
      command.courseId,
    ]);

    if (!course) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    await this.branchRepo.unassignCourseFromBranch(
      command.branchId,
      command.courseId,
    );

    return new UnassignCourseFromBranchResult(
      command.branchId,
      command.courseId,
      true,
    );
  }
}
