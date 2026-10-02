import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';

import { formatCourseModuleDeleteBlockingMessage } from '../shared/format-course-module-delete-blocking-message';

import { DeleteCourseModuleCommand } from './delete-course-module.command';
import { DeleteCourseModuleResult } from './delete-course-module.result';

export class DeleteCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: DeleteCourseModuleCommand,
  ): Promise<DeleteCourseModuleResult> {
    const record = await this.courseModuleRepo.findById(command.id, true);
    const module = await this.domainService.ensureExists(record);

    const blockingLessons =
      await this.courseModuleRepo.findDeleteBlockingLessons(module.id);

    if (blockingLessons.length > 0) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        formatCourseModuleDeleteBlockingMessage(blockingLessons),
        409,
      );
    }

    if (!module.isDeleted) {
      await this.courseModuleRepo.closeDisplayOrderGap(
        module.courseId,
        module.displayOrder,
      );
    }

    await this.courseModuleRepo.deletePermanent(module.id);

    return new DeleteCourseModuleResult(module.id);
  }
}
