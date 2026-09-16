import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CourseLessonRepository } from '@modules/course-lesson/domain/repositories/course-lesson.repository';

import { CourseLearnItem } from '../../domain/entities/course-learn-item.entity';
import { serializeKeyLearningPoints } from '../../domain/utils/key-learning-points.utils';
import type { CourseLearnItemRepository } from '../../domain/repositories/course-learn-item.repository';
import { CourseLearnItemResponseMapper } from '../../infrastructure/mappers/course-learn-item-response.mapper';
import { CourseLearnItemResult } from '../course-learn-item.result';

import { CreateCourseLearnItemCommand } from './create-course-learn-item.command';

export class CreateCourseLearnItemHandler {
  private readonly logger = new Logger(
    CreateCourseLearnItemHandler.name,
  );

  constructor(
    private readonly courseLearnItemRepo: CourseLearnItemRepository,
    private readonly courseLessonRepo: CourseLessonRepository,
  ) {}

  async execute(
    command: CreateCourseLearnItemCommand,
  ): Promise<CourseLearnItemResult> {
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
      (await this.courseLearnItemRepo.getMaxDisplayOrder(
        command.lessonId,
      )) + 1;

    const item = CourseLearnItem.create({
      id: randomUUID(),
      lessonId: command.lessonId,
      title: command.title,
      explanation: command.explanation,
      imageUrl: command.imageUrl,
      keyLearningPoints: serializeKeyLearningPoints(
        command.keyLearningPoints,
      ),
      finalThoughts: command.finalThoughts,
      summary: command.summary,
      displayOrder,
      createdBy: command.createdBy,
    });

    await this.courseLearnItemRepo.save(item);

    this.logger.log(`✅ Course learn item created: ${item.id}`);

    return CourseLearnItemResponseMapper.toResult(item);
  }
}
