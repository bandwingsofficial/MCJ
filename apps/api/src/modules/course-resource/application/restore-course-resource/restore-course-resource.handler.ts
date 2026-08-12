import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { RestoreCourseResourceCommand } from './restore-course-resource.command';

export class RestoreCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    command: RestoreCourseResourceCommand,
  ): Promise<CourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(command.id, true),
    );

    const nextDisplayOrder =
      (await this.courseResourceRepo.getMaxDisplayOrder(
        resource.lessonId,
      )) + 1;

    resource.moveTo(nextDisplayOrder, command.updatedBy);
    resource.restore(command.updatedBy);

    await this.courseResourceRepo.save(resource);

    return CourseResourceResponseMapper.toResult(resource);
  }
}
