import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizResult } from '../course-quiz.result';

import { PublishQuizCommand } from './publish-quiz.command';

export class PublishQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(command: PublishQuizCommand): Promise<CourseQuizResult> {
    const quiz = await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.id),
    );

    const questions = await this.courseQuizRepo.findQuestionsByQuizId(
      quiz.id,
    );

    this.domainService.validatePublishableQuestions(questions);

    quiz.publish(command.updatedBy);

    await this.courseQuizRepo.save(quiz);

    return CourseQuizResponseMapper.toResult(quiz);
  }
}
