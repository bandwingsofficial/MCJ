import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { ListCourseModulesQuery } from './list-course-modules.query';

export class ListCourseModulesHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
  ) {}

  async execute(
    query: ListCourseModulesQuery,
  ): Promise<CourseModuleResult[]> {
    return CourseModuleResponseMapper.toResultList(
      query.courseId
        ? await this.courseModuleRepo.findAll({
            courseId: query.courseId,
            search: query.search,
            includeDeleted: query.includeDeleted,
            skip: query.skip,
            take: query.take,
          })
        : [],
    );
  }
}
