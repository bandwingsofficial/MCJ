import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceDomainService } from '../../domain/services/course-resource-domain.service';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { UpdateCourseResourceCommand } from './update-course-resource.command';

export class UpdateCourseResourceHandler {
  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly domainService: CourseResourceDomainService,
  ) {}

  async execute(
    command: UpdateCourseResourceCommand,
  ): Promise<CourseResourceResult> {
    const resource = await this.domainService.ensureExists(
      await this.courseResourceRepo.findById(command.id),
    );

    resource.update({
      title: command.title,
      type: command.type,
      fileUrl: command.fileUrl,
      updatedBy: command.updatedBy,
    });

    await this.courseResourceRepo.save(resource);

    return CourseResourceResponseMapper.toResult(resource);
  }
}
