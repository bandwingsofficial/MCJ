import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { GetCourseLessonQuery } from './get-course-lesson.query';

export class GetCourseLessonHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
  ) {}

  async execute(
    query: GetCourseLessonQuery,
  ): Promise<CourseLessonResult> {
    const lesson = await this.domainService.ensureExists(
      await this.courseLessonRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    return CourseLessonResponseMapper.toResult(
      lesson,
      query.publicView,
    );
  }
}
