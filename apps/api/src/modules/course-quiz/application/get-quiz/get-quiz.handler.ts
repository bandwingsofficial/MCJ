import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import {
  CourseQuizDetailResult,
  CourseQuizResult,
} from '../course-quiz.result';

import { GetQuizQuery } from './get-quiz.query';

export class GetQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    query: GetQuizQuery,
  ): Promise<CourseQuizResult | CourseQuizDetailResult> {
    if (!query.id && !query.lessonId) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Quiz id or lessonId is required',
        400,
      );
    }

    const quiz = await this.domainService.ensureQuizExists(
      query.id
        ? await this.courseQuizRepo.findById(
            query.id,
            query.includeDeleted,
          )
        : await this.courseQuizRepo.findByLessonId(
            query.lessonId!,
            query.includeDeleted,
          ),
    );

    if (!query.includeQuestions) {
      return CourseQuizResponseMapper.toResult(quiz);
    }

    const questions = await this.courseQuizRepo.findQuestionsByQuizId(
      quiz.id,
    );

    return CourseQuizResponseMapper.toDetailResult(quiz, questions);
  }
}
