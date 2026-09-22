import { InvalidMovePositionException } from '@common/exceptions/invalid-move-position.exception';

import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { MoveCourseLessonCommand } from './move-course-lesson.command';

export class MoveCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: MoveCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id),
    );

    const siblings = (
      await this.courseLessonRepo.findByModuleId(lesson.moduleId, false)
    ).filter((row) => row.parentLessonId === lesson.parentLessonId);
    const maxPosition = siblings.length;

    if (
      !Number.isInteger(command.newPosition) ||
      command.newPosition < 1 ||
      command.newPosition > maxPosition
    ) {
      throw new InvalidMovePositionException(
        `Position must be between 1 and ${maxPosition}`,
      );
    }

    await this.courseLessonRepo.move(
      lesson.id,
      lesson.moduleId,
      lesson.displayOrder,
      command.newPosition,
      command.updatedBy,
      lesson.parentLessonId,
    );

    return CourseLessonResponseMapper.toResult(
      await this.domainService.ensureExists(
        await this.courseLessonRepo.findById(command.id),
      ),
    );
  }
}
