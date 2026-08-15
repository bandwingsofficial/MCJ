import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';

import { DeleteQuizCommand } from './delete-quiz.command';
import { DeleteQuizResult } from './delete-quiz.result';

export class DeleteQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(command: DeleteQuizCommand): Promise<DeleteQuizResult> {
    const quiz = await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.id),
    );

    quiz.softDelete();

    await this.courseQuizRepo.save(quiz);

    return new DeleteQuizResult(quiz.id, true, quiz.deletedAt);
  }
}
