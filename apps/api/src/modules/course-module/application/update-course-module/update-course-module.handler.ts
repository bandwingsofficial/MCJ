import { Slug } from '@common/value-objects/slug.vo';

import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { UpdateCourseModuleCommand } from './update-course-module.command';

export class UpdateCourseModuleHandler {
  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
  ) {}

  async execute(
    command: UpdateCourseModuleCommand,
  ): Promise<CourseModuleResult> {
    const module = await this.domainService.ensureExists(
      await this.courseModuleRepo.findById(command.id),
    );

    const nextSlug =
      command.title !== undefined
        ? Slug.fromTitle(command.title).getValue()
        : module.slug.getValue();

    if (command.title !== undefined) {
      await this.domainService.ensureSlugIsAvailable(
        this.courseModuleRepo,
        module.courseId,
        nextSlug,
        module.id,
      );
    }

    module.update({
      title: command.title,
      slug: command.title !== undefined ? nextSlug : undefined,
      description: command.description,
      keySkills: command.keySkills,
      thumbnailUrl: command.thumbnailUrl,
      duration: command.duration,
      updatedBy: command.updatedBy,
    });

    await this.courseModuleRepo.save(module);

    return CourseModuleResponseMapper.toResult(module);
  }
}
