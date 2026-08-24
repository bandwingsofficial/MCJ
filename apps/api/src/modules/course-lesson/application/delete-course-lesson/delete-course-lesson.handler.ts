import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';

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

    const deletedDisplayOrder = lesson.displayOrder;

    lesson.softDelete(command.deletedBy);

    await this.courseLessonRepo.save(lesson);

    await this.courseLessonRepo.closeDisplayOrderGap(
      lesson.moduleId,
      deletedDisplayOrder,
      lesson.parentLessonId,
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
