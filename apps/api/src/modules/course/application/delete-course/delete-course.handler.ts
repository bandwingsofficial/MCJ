import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { CourseHierarchyService } from '../../infrastructure/services/course-hierarchy.service';

import { DeleteCourseCommand } from './delete-course.command';
import { DeleteCourseResult } from './delete-course.result';

export class DeleteCourseHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly domainService: CourseDomainService,
    private readonly hierarchyService: CourseHierarchyService,
  ) {}

  async execute(
    command: DeleteCourseCommand,
  ): Promise<DeleteCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id),
    );

    const deletedDisplayOrder = course.displayOrder;

    course.softDelete(command.deletedBy);
    await this.courseRepo.save(course);

    await this.hierarchyService.softDeleteDescendants(
      course.id,
      command.deletedBy,
    );

    if (deletedDisplayOrder != null) {
      await this.courseRepo.closeDisplayOrderGap(
        deletedDisplayOrder,
      );
    }

    return new DeleteCourseResult(
      course.id,
      true,
      course.deletedAt,
    );
  }
}
