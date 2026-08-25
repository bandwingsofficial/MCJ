import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { DeactivateCourseModuleCommand } from './deactivate-course-module.command';

export class DeactivateCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: DeactivateCourseModuleCommand,
  ): Promise<CourseModuleResult> {
    const record = await this.courseModuleRepo.findById(command.id, true);
    const module = await this.domainService.ensureExists(record);

    if (module.isDeleted) {
      return CourseModuleResponseMapper.toResult(module);
    }

    const deactivatedDisplayOrder = module.displayOrder;

    module.softDelete(command.deactivatedBy);

    await this.courseModuleRepo.save(module);

    await this.courseModuleRepo.closeDisplayOrderGap(
      module.courseId,
      deactivatedDisplayOrder,
    );

    await this.courseModuleRepo.cascadeSoftDelete(
      module.id,
      command.deactivatedBy,
    );

    return CourseModuleResponseMapper.toResult(module);
  }
}
