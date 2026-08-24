import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';

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

    const { moduleId, displayOrder, parentLessonId } = lesson;

    await this.courseLessonRepo.deletePermanent(lesson.id);

    await this.courseLessonRepo.closeDisplayOrderGap(
      moduleId,
      displayOrder,
      parentLessonId,
    );

    return new PermanentDeleteCourseLessonResult(lesson.id, true);
  }
}
