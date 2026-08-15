import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizQuestionResult } from '../course-quiz.result';

import { ListQuestionsQuery } from './list-questions.query';

export class ListQuestionsHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    query: ListQuestionsQuery,
  ): Promise<CourseQuizQuestionResult[]> {
    await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(query.quizId),
    );

    const questions = await this.courseQuizRepo.findQuestionsByQuizId(
      query.quizId,
    );

    return CourseQuizResponseMapper.toQuestionResultList(questions);
  }
}
