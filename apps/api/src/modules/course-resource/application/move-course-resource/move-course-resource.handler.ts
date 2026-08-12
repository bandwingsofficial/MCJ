import { InvalidMovePositionException } from '@common/exceptions/invalid-move-position.exception';

import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { MoveCourseResourceCommand } from './move-course-resource.command';

export class MoveCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    command: MoveCourseResourceCommand,
  ): Promise<CourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(command.id),
    );

    const maxPosition =
      await this.courseResourceRepo.getMaxDisplayOrder(
        resource.lessonId,
      );

    if (
      !Number.isInteger(command.newPosition) ||
      command.newPosition < 1 ||
      command.newPosition > maxPosition
    ) {
      throw new InvalidMovePositionException(
        `Position must be between 1 and ${maxPosition}`,
      );
    }

    await this.courseResourceRepo.move(
      resource.id,
      resource.lessonId,
      resource.displayOrder,
      command.newPosition,
      command.updatedBy,
    );

    return CourseResourceResponseMapper.toResult(
      await this.domainService.ensureExists(
        await this.courseResourceRepo.findById(command.id),
      ),
    );
  }
}
