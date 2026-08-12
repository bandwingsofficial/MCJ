import { InvalidMovePositionException } from '@common/exceptions/invalid-move-position.exception';

import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { MoveCourseModuleCommand } from './move-course-module.command';

export class MoveCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: MoveCourseModuleCommand,
  ): Promise<CourseModuleResult> {
    const module = await this.domainService.ensureExists(
      await this.courseModuleRepo.findById(command.id),
    );

    const maxPosition =
      await this.courseModuleRepo.getMaxDisplayOrder(
        module.courseId,
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

    await this.courseModuleRepo.move(
      module.id,
      module.courseId,
      module.displayOrder,
      command.newPosition,
      command.updatedBy,
    );

    return CourseModuleResponseMapper.toResult(
      await this.domainService.ensureExists(
        await this.courseModuleRepo.findById(command.id),
      ),
    );
  }
}
