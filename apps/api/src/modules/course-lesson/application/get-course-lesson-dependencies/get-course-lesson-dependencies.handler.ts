import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import {
  type CourseLessonDeleteBlockingDependencies,
  courseLessonHasDeleteBlockingDependencies,
} from '../../domain/types/course-lesson-delete-blocking';

export class GetCourseLessonDependenciesResult {
  constructor(
    public readonly lessonId: string,
    public readonly lessonTitle: string,
    public readonly canDelete: boolean,
    public readonly blocking: CourseLessonDeleteBlockingDependencies,
  ) {}
}

export class GetCourseLessonDependenciesHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(lessonId: string): Promise<GetCourseLessonDependenciesResult> {
    const record = await this.courseLessonRepo.findById(lessonId, true);
    const lesson = await this.domainService.ensureExists(record);

    const blocking =
      await this.courseLessonRepo.findDeleteBlockingDependencies(lesson.id);

    return new GetCourseLessonDependenciesResult(
      lesson.id,
      lesson.title,
      !courseLessonHasDeleteBlockingDependencies(blocking),
      blocking,
    );
  }
}
