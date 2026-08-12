import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';

import { DeleteCourseModuleCommand } from './delete-course-module.command';
import { DeleteCourseModuleResult } from './delete-course-module.result';

export class DeleteCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: DeleteCourseModuleCommand,
  ): Promise<DeleteCourseModuleResult> {
    const module = await this.domainService.ensureExists(
      await this.courseModuleRepo.findById(command.id),
    );

    const deletedDisplayOrder = module.displayOrder;

    module.softDelete(command.deletedBy);

    await this.courseModuleRepo.save(module);

    await this.courseModuleRepo.closeDisplayOrderGap(
      module.courseId,
      deletedDisplayOrder,
    );

    await this.courseModuleRepo.cascadeSoftDelete(
      module.id,
      command.deletedBy,
    );

    return new DeleteCourseModuleResult(
      module.id,
      true,
      module.deletedAt,
    );
  }
}
