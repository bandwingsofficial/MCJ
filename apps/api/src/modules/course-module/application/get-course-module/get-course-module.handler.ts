import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';
import { CourseHierarchyService } from '../../../course/infrastructure/services/course-hierarchy.service';

import { GetCourseModuleQuery } from './get-course-module.query';

export class GetCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    query: GetCourseModuleQuery,
  ): Promise<CourseModuleResult> {
    const module = await this.domainService.ensureExists(
      await this.courseModuleRepo.findById(
        query.id,
        query.includeDeleted,
      ),
    );

    const countsByModuleId = await this.hierarchyService.getModuleCountsByIds([
      module.id,
    ]);

    return CourseModuleResponseMapper.toResult(
      module,
      countsByModuleId.get(module.id),
    );
  }
}
