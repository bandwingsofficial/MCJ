import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { ListCourseResourcesQuery } from './list-course-resources.query';

export class ListCourseResourcesHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
  ) {}

  async execute(
    query: ListCourseResourcesQuery,
  ): Promise<CourseResourceResult[]> {
    if (!query.lessonId) {
      return [];
    }

    const resources = await this.courseResourceRepo.findAll({
      lessonId: query.lessonId,
      type: query.type,
      search: query.search,
      includeDeleted: query.includeDeleted,
      skip: query.skip,
      take: query.take,
    });

    return CourseResourceResponseMapper.toResultList(resources);
  }
}
