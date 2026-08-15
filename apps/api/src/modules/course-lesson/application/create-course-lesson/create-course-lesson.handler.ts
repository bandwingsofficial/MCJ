import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { Slug } from '@common/value-objects/slug.vo';
import type { CourseModuleRepository } from '@modules/course-module/domain/repositories/course-module.repository';

import { CourseLesson } from '../../domain/entities/course-lesson.entity';
import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { CourseLessonResult } from '../course-lesson.result';

import { CreateCourseLessonCommand } from './create-course-lesson.command';

export class CreateCourseLessonHandler {
  private readonly logger = new Logger(
    CreateCourseLessonHandler.name,
  );

  constructor(
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly domainService: CourseLessonDomainService,
    private readonly courseModuleRepo: CourseModuleRepository,
  ) {}

  async execute(
    command: CreateCourseLessonCommand,
  ): Promise<CourseLessonResult> {
    const module = await this.courseModuleRepo.findById(
      command.moduleId,
      true,
    );

    if (!module) {
      throw new BaseException(
        ERROR_CODES.COURSE_MODULE_NOT_FOUND,
        'Course module not found',
        404,
      );
    }

    if (module.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_MODULE_DELETED,
        'Course module is deleted',
        400,
      );
    }

    const slug = Slug.fromTitle(command.title).getValue();

    await this.domainService.ensureSlugIsAvailable(
      this.courseLessonRepo,
      command.moduleId,
      slug,
    );

    const displayOrder =
      (await this.courseLessonRepo.getMaxDisplayOrder(
        command.moduleId,
      )) + 1;

    const lesson = CourseLesson.create({
      id: randomUUID(),
      moduleId: command.moduleId,
      title: command.title,
      slug,
      description: command.description,
      videoUrl: command.videoUrl,
      contentType: command.contentType,
      duration: command.duration,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.courseLessonRepo.save(lesson);

    this.logger.log(`✅ Course lesson created: ${lesson.id}`);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
