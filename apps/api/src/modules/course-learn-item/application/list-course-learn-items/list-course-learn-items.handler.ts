import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemResponseMapper } from '../../infrastructure/mappers/course-learn-item-response.mapper';
import { CourseLearnItemResult } from '../course-learn-item.result';

import { ListCourseLearnItemsQuery } from './list-course-learn-items.query';

export class ListCourseLearnItemsHandler {
  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
  ) {}

  async execute(
    query: ListCourseLearnItemsQuery,
  ): Promise<CourseLearnItemResult[]> {
    const items = await this.courseLearnItemRepo.findAll({
      lessonId: query.lessonId,
      search: query.search,
      skip: query.skip,
      take: query.take,
    });

    return items.map(CourseLearnItemResponseMapper.toResult);
  }
}
