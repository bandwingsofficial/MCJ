import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemDomainService } from '../../domain/services/course-learn-item-domain.service';

import { DeleteCourseLearnItemCommand } from './delete-course-learn-item.command';
import { DeleteCourseLearnItemResult } from './delete-course-learn-item.result';

export class DeleteCourseLearnItemHandler {
  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
    private readonly domainService: CourseLearnItemDomainService,
  ) {}

  async execute(
    command: DeleteCourseLearnItemCommand,
  ): Promise<DeleteCourseLearnItemResult> {
    const item = await this.domainService.ensureExists(
      await this.courseLearnItemRepo.findById(command.id),
    );

    const { lessonId, displayOrder } = item;

    await this.courseLearnItemRepo.deletePermanent(item.id);
    await this.courseLearnItemRepo.closeDisplayOrderGap(
      lessonId,
      displayOrder,
    );

    return new DeleteCourseLearnItemResult(item.id, true);
  }
}
