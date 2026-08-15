import { randomUUID } from 'crypto';

import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizQuestionResult } from '../course-quiz.result';

import { UpdateQuestionCommand } from './update-question.command';

export class UpdateQuestionHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    command: UpdateQuestionCommand,
  ): Promise<CourseQuizQuestionResult> {
    const question = await this.domainService.ensureQuestionExists(
      await this.courseQuizRepo.findQuestionById(command.id),
    );

    question.update({
      questionText: command.questionText,
      type: command.type,
      explanation: command.explanation,
      points: command.points,
      options:
        command.options !== undefined
          ? command.options.map((option, index) => ({
              id: randomUUID(),
              optionText: option.optionText,
              isCorrect: option.isCorrect,
              displayOrder: option.displayOrder ?? index,
            }))
          : undefined,
    });

    await this.courseQuizRepo.saveQuestion(question);

    return CourseQuizResponseMapper.toQuestionResult(question);
  }
}
