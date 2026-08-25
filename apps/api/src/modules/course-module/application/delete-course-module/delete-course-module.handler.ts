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
    const record = await this.courseModuleRepo.findById(command.id, true);
    const module = await this.domainService.ensureExists(record);

    if (!module.isDeleted) {
      await this.courseModuleRepo.closeDisplayOrderGap(
        module.courseId,
        module.displayOrder,
      );
    }

    await this.courseModuleRepo.deletePermanent(module.id);

    return new DeleteCourseModuleResult(module.id);
  }
}
