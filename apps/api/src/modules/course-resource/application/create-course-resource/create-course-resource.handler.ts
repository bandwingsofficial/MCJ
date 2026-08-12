import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CourseLessonRepository } from '@modules/course-lesson/domain/repositories/course-lesson.repository';

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
  ) {}

  async execute(
    command: CreateCourseResourceCommand,
  ): Promise<CourseResourceResult> {
    const lesson = await this.courseLessonRepo.findById(
      command.lessonId,
      true,
    );

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

    const displayOrder =
      (await this.courseResourceRepo.getMaxDisplayOrder(
        command.lessonId,
      )) + 1;

    const resource = CourseResource.create({
      id: randomUUID(),
      lessonId: command.lessonId,
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
