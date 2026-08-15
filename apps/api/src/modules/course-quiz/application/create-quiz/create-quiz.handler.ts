import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import type { CourseLessonRepository } from '@modules/course-lesson/domain/repositories/course-lesson.repository';

import { CourseQuiz } from '../../domain/entities/course-quiz.entity';
import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizResult } from '../course-quiz.result';

import { CreateQuizCommand } from './create-quiz.command';

export class CreateQuizHandler {
  private readonly logger = new Logger(CreateQuizHandler.name);

  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly courseLessonRepo: CourseLessonRepository,
  ) {}

  async execute(command: CreateQuizCommand): Promise<CourseQuizResult> {
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

    const existingQuiz = await this.courseQuizRepo.findByLessonId(
      command.lessonId,
      true,
    );

    if (existingQuiz && !existingQuiz.isDeleted) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_ALREADY_EXISTS,
        'A quiz already exists for this lesson',
        400,
      );
    }

    if (
      command.passingScore !== undefined &&
      command.passingScore !== null &&
      (command.passingScore < 0 || command.passingScore > 100)
    ) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Passing score must be between 0 and 100',
        400,
      );
    }

    const quiz = CourseQuiz.create({
      id: randomUUID(),
      lessonId: command.lessonId,
      title: command.title,
      description: command.description,
      passingScore: command.passingScore,
      timeLimitMinutes: command.timeLimitMinutes,
      createdBy: command.createdBy,
    });

    await this.courseQuizRepo.save(quiz);

    this.logger.log(`✅ Course quiz created: ${quiz.id}`);

    return CourseQuizResponseMapper.toResult(quiz);
  }
}
