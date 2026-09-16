import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { serializeKeyLearningPoints } from '../../domain/utils/key-learning-points.utils';
import { CourseLearnItemDomainService } from '../../domain/services/course-learn-item-domain.service';
import { CourseLearnItemResponseMapper } from '../../infrastructure/mappers/course-learn-item-response.mapper';
import { CourseLearnItemResult } from '../course-learn-item.result';

import { UpdateCourseLearnItemCommand } from './update-course-learn-item.command';

export class UpdateCourseLearnItemHandler {
  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
    private readonly domainService: CourseLearnItemDomainService,
  ) {}

  async execute(
    command: UpdateCourseLearnItemCommand,
  ): Promise<CourseLearnItemResult> {
    const item = await this.domainService.ensureExists(
      await this.courseLearnItemRepo.findById(command.id),
    );

    item.update({
      title: command.title,
      explanation: command.explanation,
      imageUrl: command.imageUrl,
      keyLearningPoints:
        command.keyLearningPoints === undefined
          ? undefined
          : serializeKeyLearningPoints(command.keyLearningPoints),
      finalThoughts: command.finalThoughts,
      summary: command.summary,
      updatedBy: command.updatedBy,
    });

    await this.courseLearnItemRepo.save(item);

    return CourseLearnItemResponseMapper.toResult(item);
  }
}
