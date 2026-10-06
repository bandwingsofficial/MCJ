import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CourseLessonRepository } from '@modules/course-lesson/domain/repositories/course-lesson.repository';
import type { CourseModuleRepository } from '@modules/course-module/domain/repositories/course-module.repository';

import { CourseResource } from '../../domain/entities/course-resource.entity';
import type { CourseResourceRepository } from '../../domain/repositories/course-resource.repository';
import { CourseResourceResponseMapper } from '../../infrastructure/mappers/course-resource-response.mapper';
import { CourseResourceResult } from '../course-resource.result';

import { CreateCourseResourceCommand } from './create-course-resource.command';

export class CreateCourseResourceHandler {
  private readonly logger = new Logger(
    CreateCourseResourceHandler.name,
  );

  constructor(
    private readonly courseResourceRepo: CourseResourceRepository,
    private readonly courseLessonRepo: CourseLessonRepository,
    private readonly courseModuleRepo: CourseModuleRepository,
  ) {}

  async execute(
    command: CreateCourseResourceCommand,
  ): Promise<CourseResourceResult> {
    const lessonId = command.lessonId?.trim() || undefined;
    const moduleId = command.moduleId?.trim() || undefined;

    if (!lessonId && !moduleId) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Lesson ID or module ID is required',
        400,
      );
    }

    if (lessonId && moduleId) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Resource cannot belong to both a lesson and a module',
        400,
      );
    }

    let displayOrder = 0;

    if (lessonId) {
      const lesson = await this.courseLessonRepo.findById(lessonId, true);

      if (!lesson) {
        throw new BaseException(
          ERROR_CODES.COURSE_LESSON_NOT_FOUND,
          'Course lesson not found',
          404,
        );
      }

      if (lesson.isDeleted) {
        throw new BaseException(
          ERROR_CODES.COURSE_LESSON_DELETED,
          'Course lesson is deleted',
          400,
        );
      }

      displayOrder =
        (await this.courseResourceRepo.getMaxDisplayOrder(lessonId)) + 1;
    } else if (moduleId) {
      const courseModule = await this.courseModuleRepo.findById(
        moduleId,
        true,
      );

      if (!courseModule) {
        throw new BaseException(
          ERROR_CODES.COURSE_MODULE_NOT_FOUND,
          'Course module not found',
          404,
        );
      }

      if (courseModule.isDeleted) {
        throw new BaseException(
          ERROR_CODES.COURSE_MODULE_DELETED,
          'Course module is deleted',
          400,
        );
      }

      displayOrder =
        (await this.courseResourceRepo.getMaxDisplayOrderForModule(
          moduleId,
        )) + 1;
    }

    const resource = CourseResource.create({
      id: randomUUID(),
      lessonId: lessonId ?? null,
      moduleId: moduleId ?? null,
      title: command.title,
      type: command.type,
      fileUrl: command.fileUrl,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.courseResourceRepo.save(resource);

    this.logger.log(`✅ Course resource created: ${resource.id}`);

    return CourseResourceResponseMapper.toResult(resource);
  }
}
