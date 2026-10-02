import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { courseLessonHasDeleteBlockingDependencies } from '../../domain/types/course-lesson-delete-blocking';

import { formatCourseLessonDeleteBlockingMessage } from '../shared/format-course-lesson-delete-blocking-message';

import { DeleteCourseLessonCommand } from './delete-course-lesson.command';
import { DeleteCourseLessonResult } from './delete-course-lesson.result';

export class DeleteCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: DeleteCourseLessonCommand,
  ): Promise<DeleteCourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id),
    );

    const blockingDependencies =
      await this.courseLessonRepo.findDeleteBlockingDependencies(lesson.id);

    if (courseLessonHasDeleteBlockingDependencies(blockingDependencies)) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        formatCourseLessonDeleteBlockingMessage(blockingDependencies),
        409,
      );
    }

    const deletedDisplayOrder = lesson.displayOrder;

    lesson.softDelete(command.deletedBy);

    await this.courseLessonRepo.save(lesson);

    await this.courseLessonRepo.closeDisplayOrderGap(
      lesson.moduleId,
      deletedDisplayOrder,
      lesson.parentLessonId,
      lesson.batchId,
    );

    await this.courseLessonRepo.cascadeSoftDelete(
      lesson.id,
      command.deletedBy,
    );

    return new DeleteCourseLessonResult(
      lesson.id,
      true,
      lesson.deletedAt,
    );
  }
}
