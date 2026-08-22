import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';

import { PermanentDeleteCourseResourceCommand } from './permanent-delete-course-resource.command';
import { PermanentDeleteCourseResourceResult } from './permanent-delete-course-resource.result';

export class PermanentDeleteCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCourseResourceCommand,
  ): Promise<PermanentDeleteCourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(command.id, true),
    );

    const wasActive = !resource.isDeleted;
    const { lessonId, displayOrder } = resource;

    await this.courseResourceRepo.deletePermanent(resource.id);

    if (wasActive) {
      await this.courseResourceRepo.closeDisplayOrderGap(
        lessonId,
        displayOrder,
      );
    }

    return new PermanentDeleteCourseResourceResult(resource.id, true);
  }
}
