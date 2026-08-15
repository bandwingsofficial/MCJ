import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';

import { DeleteQuestionCommand } from './delete-question.command';

export class DeleteQuestionResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
  ) {}
}

export class DeleteQuestionHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    command: DeleteQuestionCommand,
  ): Promise<DeleteQuestionResult> {
    const question = await this.domainService.ensureQuestionExists(
      await this.courseQuizRepo.findQuestionById(command.id),
    );

    const deletedDisplayOrder = question.displayOrder;

    await this.courseQuizRepo.deleteQuestion(command.id);

    await this.courseQuizRepo.closeQuestionDisplayOrderGap(
      question.quizId,
      deletedDisplayOrder,
    );

    return new DeleteQuestionResult(command.id, true);
  }
}
