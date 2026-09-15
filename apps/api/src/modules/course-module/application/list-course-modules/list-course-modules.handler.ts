import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';
import { CourseHierarchyService } from '../../../course/infrastructure/services/course-hierarchy.service';

import { ListCourseModulesQuery } from './list-course-modules.query';

export class ListCourseModulesHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    query: ListCourseModulesQuery,
  ): Promise<CourseModuleResult[]> {
    const modules = query.courseId
      ? await this.courseModuleRepo.findAll({
          courseId: query.courseId,
          search: query.search,
          includeDeleted: query.includeDeleted,
          skip: query.skip,
          take: query.take,
        })
      : [];

    const countsByModuleId = await this.hierarchyService.getModuleCountsByIds(
      modules.map((module) => module.id),
    );

    return CourseModuleResponseMapper.toResultList(
      modules,
      countsByModuleId,
    );
  }
}
