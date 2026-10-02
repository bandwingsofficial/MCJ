import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';

import type { CourseModuleDeleteBlockingLesson } from '../../domain/types/course-module-delete-blocking-lesson';

export class GetCourseModuleDependenciesResult {
  constructor(
    public readonly moduleId: string,
    public readonly moduleTitle: string,
    public readonly canDelete: boolean,
    public readonly canDeactivate: boolean,
    public readonly blockingLessons: CourseModuleDeleteBlockingLesson[],
  ) {}
}

export class GetCourseModuleDependenciesHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(moduleId: string): Promise<GetCourseModuleDependenciesResult> {
    const record = await this.courseModuleRepo.findById(moduleId, true);
    const module = await this.domainService.ensureExists(record);

    const blockingLessons =
      await this.courseModuleRepo.findDeleteBlockingLessons(module.id);

    const canModify = blockingLessons.length === 0;

    return new GetCourseModuleDependenciesResult(
      module.id,
      module.title,
      canModify,
      canModify,
      blockingLessons,
    );
  }
}
