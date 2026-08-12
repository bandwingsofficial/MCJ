import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { RestoreCourseLessonCommand } from './restore-course-lesson.command';

export class RestoreCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: RestoreCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id, true),
    );

    const nextDisplayOrder =
      (await this.courseLessonRepo.getMaxDisplayOrder(
        lesson.moduleId,
      )) + 1;

    lesson.moveTo(nextDisplayOrder, command.updatedBy);
    lesson.restore(command.updatedBy);

    await this.courseLessonRepo.save(lesson);

    await this.courseLessonRepo.cascadeRestore(lesson.id);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
