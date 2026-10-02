import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { courseLessonHasDeleteBlockingDependencies } from '../../domain/types/course-lesson-delete-blocking';

import { formatCourseLessonDeleteBlockingMessage } from '../shared/format-course-lesson-delete-blocking-message';

import { PermanentDeleteCourseLessonCommand } from './permanent-delete-course-lesson.command';
import { PermanentDeleteCourseLessonResult } from './permanent-delete-course-lesson.result';

export class PermanentDeleteCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCourseLessonCommand,
  ): Promise<PermanentDeleteCourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id, true),
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

    const { moduleId, displayOrder, parentLessonId, batchId } = lesson;

    await this.courseLessonRepo.deletePermanent(lesson.id);

    await this.courseLessonRepo.closeDisplayOrderGap(
      moduleId,
      displayOrder,
      parentLessonId,
      batchId,
    );

    return new PermanentDeleteCourseLessonResult(lesson.id, true);
  }
}
