import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import {
  GetCourseResult,
  CourseBranchResult,
} from '../get-course/get-course.result';

import { UpdateCourseStatusCommand } from './update-course-status.command';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { formatCourseDeactivateBlockingMessage } from '../shared/format-course-delete-blocking-message';

import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

export class UpdateCourseStatusHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(
    command: UpdateCourseStatusCommand,
  ): Promise<GetCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id),
    );

    if (command.activate) {
      if (course.displayOrder == null) {
        const nextDisplayOrder =
          (await this.courseRepo.getMaxActiveDisplayOrder()) + 1;

        course.changeDisplayOrder(nextDisplayOrder);
      }

      course.activate(command.updatedBy);
    } else {
      const blockingBatches =
        await this.courseRepo.findDeleteBlockingBatches(course.id);

      if (blockingBatches.length > 0) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          formatCourseDeactivateBlockingMessage(blockingBatches),
          409,
        );
      }

      if (course.displayOrder != null) {
        await this.courseRepo.closeDisplayOrderGap(
          course.displayOrder,
        );
      }

      course.changeDisplayOrder(null);
      course.deactivate(command.updatedBy);
    }

    await this.courseRepo.save(course);

    const branchEntities = await Promise.all(
      course.branchIds.map(async (branchId) => {
        const branch = await this.branchRepo.findById(
          branchId,
        );

        if (!branch) {
          throw new BranchNotFoundException(
            branchId,
          );
        }

        return branch;
      }),
    );

    const branches = branchEntities.map(
      (branch) =>
        new CourseBranchResult(
          branch.id,
          branch.branchName.getValue(),
          branch.branchCode.getValue(),
        ),
    );

    return GetCourseResult.fromEntity(
      course,
      branches,
    );
  }
}