import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';

import { CourseQuizQuestion } from '../../domain/entities/course-quiz-question.entity';
import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizQuestionResult } from '../course-quiz.result';

import { CreateQuestionCommand } from './create-question.command';

export class CreateQuestionHandler {
  private readonly logger = new Logger(CreateQuestionHandler.name);

  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(
    command: CreateQuestionCommand,
  ): Promise<CourseQuizQuestionResult> {
    await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.quizId),
    );

    const displayOrder =
      (await this.courseQuizRepo.getMaxQuestionDisplayOrder(
        command.quizId,
      )) + 1;

    const question = CourseQuizQuestion.create({
      id: randomUUID(),
      quizId: command.quizId,
      questionText: command.questionText,
      type: command.type,
      explanation: command.explanation,
      points: command.points,
      displayOrder,
      options: command.options.map((option, index) => ({
        id: randomUUID(),
        optionText: option.optionText,
        isCorrect: option.isCorrect,
        displayOrder: option.displayOrder ?? index,
      })),
    });

    await this.courseQuizRepo.saveQuestion(question);

    this.logger.log(`✅ Course quiz question created: ${question.id}`);

    return CourseQuizResponseMapper.toQuestionResult(question);
  }
}
