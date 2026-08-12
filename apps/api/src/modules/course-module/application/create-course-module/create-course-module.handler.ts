import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { Slug } from '@common/value-objects/slug.vo';
import type { CourseRepository } from '@modules/course/domain/repositories/course.repository';

import { CourseModule } from '../../domain/entities/course-module.entity';
import type { CourseModuleRepository } from '../../domain/repositories/course-module.repository';
import { CourseModuleDomainService } from '../../domain/services/course-module-domain.service';
import { CourseModuleResponseMapper } from '../../infrastructure/mappers/course-module-response.mapper';
import { CourseModuleResult } from '../course-module.result';

import { CreateCourseModuleCommand } from './create-course-module.command';

export class CreateCourseModuleHandler {
  private readonly logger = new Logger(
    CreateCourseModuleHandler.name,
  );

  constructor(
    private readonly courseModuleRepo: CourseModuleRepository,
    private readonly domainService: CourseModuleDomainService,
    private readonly courseRepo: CourseRepository,
  ) {}

  async execute(
    command: CreateCourseModuleCommand,
  ): Promise<CourseModuleResult> {
    const course = await this.courseRepo.findById(
      command.courseId,
      true,
    );

    if (!course) {
      throw new BaseException(
        ERROR_CODES.COURSE_NOT_FOUND,
        'Course not found',
        404,
      );
    }

    if (course.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_DELETED,
        'Course is deleted',
        400,
      );
    }

    const slug = Slug.fromTitle(command.title).getValue();

    await this.domainService.ensureSlugIsAvailable(
      this.courseModuleRepo,
      command.courseId,
      slug,
    );

    const displayOrder =
      (await this.courseModuleRepo.getMaxDisplayOrder(
        command.courseId,
      )) + 1;

    const module = CourseModule.create({
      id: randomUUID(),
      courseId: command.courseId,
      title: command.title,
      slug,
      description: command.description,
      keySkills: command.keySkills,
      thumbnailUrl: command.thumbnailUrl,
      duration: command.duration,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.courseModuleRepo.save(module);

    this.logger.log(`✅ Course module created: ${module.id}`);

    return CourseModuleResponseMapper.toResult(module);
  }
}
