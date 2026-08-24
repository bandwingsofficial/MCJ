import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { LessonContentType } from '../../domain/enums/lesson-content-type.enum';
import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { SetLessonPreviewCommand } from './set-lesson-preview.command';

export class SetLessonPreviewHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: SetLessonPreviewCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id),
    );

    if (lesson.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_DELETED,
        'Cannot change preview access for a deleted lesson',
        400,
      );
    }

    if (lesson.contentType !== LessonContentType.LESSON) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Preview access can only be changed for plain lessons',
        400,
      );
    }

    lesson.setPreview(command.isPreview, command.updatedBy);

    await this.courseLessonRepo.save(lesson);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
