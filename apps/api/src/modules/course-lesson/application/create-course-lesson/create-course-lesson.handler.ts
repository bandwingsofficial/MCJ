import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CourseModuleRepository } from '@modules/course-module/domain/repositories/course-module.repository';

import { CourseLesson } from '../../domain/entities/course-lesson.entity';
import type { CourseLessonRepository } from '../../domain/repositories/course-lesson.repository';
import { CourseLessonDomainService } from '../../domain/services/course-lesson-domain.service';
import { LessonContentType } from '../../domain/enums/lesson-content-type.enum';
import { assertBatchLiveRecordedContext } from '../../domain/utils/batch-live-recorded-context.util';
import { CourseLessonResponseMapper } from '../../infrastructure/mappers/course-lesson-response.mapper';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
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
    private readonly prisma: PrismaService,
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

    if (command.parentLessonId) {
      const parentLesson = await this.courseLessonRepo.findById(
        command.parentLessonId,
        true,
      );

      if (!parentLesson || parentLesson.moduleId !== command.moduleId) {
        throw new BaseException(
          ERROR_CODES.COURSE_LESSON_NOT_FOUND,
          'Parent lesson not found in this module',
          404,
        );
      }
    }

    const title = command.title.trim();

    if (!title) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Lesson title is required',
        400,
      );
    }

    const parentLessonId = command.parentLessonId ?? null;
    const contentType = command.contentType ?? LessonContentType.LESSON;
    const branchId = command.branchId?.trim() || null;
    const batchId = command.batchId?.trim() || null;

    if (contentType === LessonContentType.LIVE_RECORDED_VIDEO) {
      if (!branchId || !batchId) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'branchId and batchId are required for live recorded videos',
          400,
        );
      }

      await assertBatchLiveRecordedContext(this.prisma, {
        branchId,
        batchId,
        moduleId: command.moduleId,
        contentType,
      });
    }

    const slug = await this.domainService.resolveAvailableSlug(
      this.courseLessonRepo,
      command.moduleId,
      parentLessonId,
      title,
      undefined,
      batchId,
    );

    const displayOrder =
      (await this.courseLessonRepo.getMaxDisplayOrder(
        command.moduleId,
        parentLessonId,
        batchId,
      )) + 1;

    const lesson = CourseLesson.create({
      id: randomUUID(),
      moduleId: command.moduleId,
      parentLessonId,
      branchId,
      batchId,
      title,
      slug,
      description: command.description,
      videoUrl: command.videoUrl,
      contentType,
      duration: command.duration,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.courseLessonRepo.save(lesson);

    this.logger.log(`✅ Course lesson created: ${lesson.id}`);

    return CourseLessonResponseMapper.toResult(lesson);
  }
}
