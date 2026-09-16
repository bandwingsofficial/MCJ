import { InvalidMovePositionException } from '@common/exceptions/invalid-move-position.exception';

import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemDomainService } from '../../domain/services/course-learn-item-domain.service';
import { CourseLearnItemResponseMapper } from '../../infrastructure/mappers/course-learn-item-response.mapper';
import { CourseLearnItemResult } from '../course-learn-item.result';

import { MoveCourseLearnItemCommand } from './move-course-learn-item.command';

export class MoveCourseLearnItemHandler {
  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
    private readonly domainService: CourseLearnItemDomainService,
  ) {}

  async execute(
    command: MoveCourseLearnItemCommand,
  ): Promise<CourseLearnItemResult> {
    const item = await this.domainService.ensureExists(
      await this.courseLearnItemRepo.findById(command.id),
    );

    const maxPosition =
      await this.courseLearnItemRepo.getMaxDisplayOrder(item.lessonId);

    if (
      !Number.isInteger(command.newPosition) ||
      command.newPosition < 1 ||
      command.newPosition > maxPosition
    ) {
      throw new InvalidMovePositionException(
        `Position must be between 1 and ${maxPosition}`,
      );
    }

    await this.courseLearnItemRepo.move(
      item.id,
      item.lessonId,
      item.displayOrder,
      command.newPosition,
      command.updatedBy,
    );

    return CourseLearnItemResponseMapper.toResult(
      await this.domainService.ensureExists(
        await this.courseLearnItemRepo.findById(command.id),
      ),
    );
  }
}
