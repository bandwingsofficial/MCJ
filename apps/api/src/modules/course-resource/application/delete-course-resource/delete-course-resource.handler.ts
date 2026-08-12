import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';

import { DeleteCourseResourceCommand } from './delete-course-resource.command';
import { DeleteCourseResourceResult } from './delete-course-resource.result';

export class DeleteCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    command: DeleteCourseResourceCommand,
  ): Promise<DeleteCourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(command.id),
    );

    const deletedDisplayOrder = resource.displayOrder;

    resource.softDelete(command.deletedBy);

    await this.courseResourceRepo.save(resource);

    await this.courseResourceRepo.closeDisplayOrderGap(
      resource.lessonId,
      deletedDisplayOrder,
    );

    return new DeleteCourseResourceResult(
      resource.id,
      true,
      resource.deletedAt,
    );
  }
}
