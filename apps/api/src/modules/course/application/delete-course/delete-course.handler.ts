import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { formatCourseDeleteBlockingMessage } from '../shared/format-course-delete-blocking-message';

import { DeleteCourseCommand } from './delete-course.command';
import { DeleteCourseResult } from './delete-course.result';

export class DeleteCourseHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    command: DeleteCourseCommand,
  ): Promise<DeleteCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id),
    );

    const blockingBatches =
      await this.courseRepo.findDeleteBlockingBatches(course.id);

    if (blockingBatches.length > 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        formatCourseDeleteBlockingMessage(blockingBatches),
        409,
      );
    }

    const deletedDisplayOrder = course.displayOrder;

    course.softDelete(command.deletedBy);
    await this.courseRepo.save(course);

    await this.hierarchyService.softDeleteDescendants(
      course.id,
      command.deletedBy,
    );

    if (deletedDisplayOrder != null) {
      await this.courseRepo.closeDisplayOrderGap(
        deletedDisplayOrder,
      );
    }

    return new DeleteCourseResult(
      course.id,
      true,
      course.deletedAt,
    );
  }
}
