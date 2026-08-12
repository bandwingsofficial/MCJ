import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { RestoreCourseModuleCommand } from './restore-course-module.command';

export class RestoreCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: RestoreCourseModuleCommand,
  ): Promise<CourseModuleResult> {
    const module = await this.domainService.ensureExists(
      await this.courseModuleRepo.findById(command.id, true),
    );

    const nextDisplayOrder =
      (await this.courseModuleRepo.getMaxDisplayOrder(
        module.courseId,
      )) + 1;

    module.moveTo(nextDisplayOrder, command.updatedBy);
    module.restore(command.updatedBy);

    await this.courseModuleRepo.save(module);

    await this.courseModuleRepo.cascadeRestore(module.id);

    return CourseModuleResponseMapper.toResult(module);
  }
}
