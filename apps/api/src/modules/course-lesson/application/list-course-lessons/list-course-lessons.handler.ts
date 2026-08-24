import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { ListCourseLessonsQuery } from './list-course-lessons.query';

export class ListCourseLessonsHandler {
  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
  ) {}

  async execute(
    query: ListCourseLessonsQuery,
  ): Promise<CourseLessonResult[]> {
    const lessons = await this.courseLessonRepo.findAll({
      moduleId: query.moduleId,
      parentLessonId: query.parentLessonId,
      contentType: query.contentType,
      search: query.search,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    });

    return CourseLessonResponseMapper.toResultList(lessons);
  }
}
