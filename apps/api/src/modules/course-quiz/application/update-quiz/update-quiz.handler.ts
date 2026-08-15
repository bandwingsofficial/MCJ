import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseQuizRepository } from '../../domain/repositories/course-quiz.repository';
import { CourseQuizDomainService } from '../../domain/services/course-quiz-domain.service';
import { CourseQuizResponseMapper } from '../../infrastructure/mappers/course-quiz-response.mapper';
import { CourseQuizResult } from '../course-quiz.result';

import { UpdateQuizCommand } from './update-quiz.command';

export class UpdateQuizHandler {
  constructor(
    private readonly courseQuizRepo: CourseQuizRepository,
    private readonly domainService: CourseQuizDomainService,
  ) {}

  async execute(command: UpdateQuizCommand): Promise<CourseQuizResult> {
    const quiz = await this.domainService.ensureQuizExists(
      await this.courseQuizRepo.findById(command.id),
    );

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

    quiz.update({
      title: command.title,
      description: command.description,
      passingScore: command.passingScore,
      timeLimitMinutes: command.timeLimitMinutes,
      displayOrder: command.displayOrder,
      updatedBy: command.updatedBy,
    });

    await this.courseQuizRepo.save(quiz);

    return CourseQuizResponseMapper.toResult(quiz);
  }
}
