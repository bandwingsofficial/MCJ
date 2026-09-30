import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { UpdateCourseLessonCommand } from './update-course-lesson.command';

export class UpdateCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    command: UpdateCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(command.id),
    );

    const nextTitle =
      command.title !== undefined ? command.title.trim() : undefined;

    const nextSlug =
      nextTitle !== undefined
        ? await this.domainService.resolveAvailableSlug(
            this.courseLessonRepo,
            lesson.moduleId,
            lesson.parentLessonId,
            nextTitle,
            lesson.id,
          )
        : lesson.slug.getValue();

    lesson.update({
      title: nextTitle,
      slug: nextTitle !== undefined ? nextSlug : undefined,
      description: command.description,
      videoUrl: command.videoUrl,
      contentType: command.contentType,
      duration: command.duration,
      updatedBy: command.updatedBy,
    });

    await this.courseLessonRepo.save(lesson);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
