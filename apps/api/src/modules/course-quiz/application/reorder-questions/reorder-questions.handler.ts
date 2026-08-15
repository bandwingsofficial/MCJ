import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizQuestionResult } from '../course-quiz.result';

import { ReorderQuestionsCommand } from './reorder-questions.command';

export class ReorderQuestionsHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    command: ReorderQuestionsCommand,
  ): Promise<CourseQuizQuestionResult[]> {
    await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.quizId),
    );

    await this.courseQuizRepo.reorderQuestions(
      command.quizId,
      command.questionIds,
    );

    const questions = await this.courseQuizRepo.findQuestionsByQuizId(
      command.quizId,
    );

    return CourseQuizResponseMapper.toQuestionResultList(questions);
  }
}
