import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { DeactivateCourseLessonCommand } from './deactivate-course-lesson.command';

export class DeactivateCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: DeactivateCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id),
    );

    if (lesson.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_LESSON_DELETED,
        'Course lesson is already inactive',
        400,
      );
    }

    lesson.softDelete(command.deactivatedBy);

    await this.courseLessonRepo.save(lesson);

    await this.courseLessonRepo.cascadeSoftDelete(
      lesson.id,
      command.deactivatedBy,
    );

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
