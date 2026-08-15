import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { ActivateCourseLessonCommand } from './activate-course-lesson.command';

export class ActivateCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: ActivateCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id, true),
    );

    if (!lesson.isDeleted) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Course lesson is already active',
        400,
      );
    }

    lesson.restore(command.updatedBy);

    await this.courseLessonRepo.save(lesson);

    await this.courseLessonRepo.cascadeRestore(lesson.id);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
