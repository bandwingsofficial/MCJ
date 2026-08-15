import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizResult } from '../course-quiz.result';

import { RestoreQuizCommand } from './restore-quiz.command';

export class RestoreQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(command: RestoreQuizCommand): Promise<CourseQuizResult> {
    const quiz = await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.id, true),
    );

    quiz.restore(command.updatedBy);

    await this.courseQuizRepo.save(quiz);

    return CourseQuizResponseMapper.toResult(quiz);
  }
}
