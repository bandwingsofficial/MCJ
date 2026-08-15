import { Injectable } from '@nestjs/common';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { CourseQuiz } from '../entities/course-quiz.entity';
import type { CourseQuizQuestion } from '../entities/course-quiz-question.entity';
import { QuizQuestionType } from '../enums/quiz-question-type.enum';

@Injectable()
export class CourseQuizDomainService {
  async ensureQuizExists(
    quiz: CourseQuiz | null,
  ): Promise<CourseQuiz> {
    if (!quiz) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_NOT_FOUND,
        'Course quiz not found',
        404,
      );
    }

    return quiz;
  }

  async ensureQuestionExists(
    question: CourseQuizQuestion | null,
  ): Promise<CourseQuizQuestion> {
    if (!question) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_QUESTION_NOT_FOUND,
        'Course quiz question not found',
        404,
      );
    }

    return question;
  }

  validatePublishableQuestions(questions: CourseQuizQuestion[]): void {
    if (questions.length === 0) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
        'Quiz must have at least one question before publishing',
        400,
      );
    }

    for (const question of questions) {
      this.validateQuestionForPublish(question);
    }
  }

  private validateQuestionForPublish(question: CourseQuizQuestion): void {
    const options = question.options;

    if (options.length === 0) {
      throw new BaseException(
        ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
        `Question "${question.questionText}" must have options`,
        400,
      );
    }

    const correctCount = options.filter((option) => option.isCorrect).length;

    switch (question.type) {
      case QuizQuestionType.MULTIPLE_CHOICE:
        if (options.length < 2) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `Multiple choice question "${question.questionText}" must have at least 2 options`,
            400,
          );
        }
        if (correctCount !== 1) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `Multiple choice question "${question.questionText}" must have exactly one correct answer`,
            400,
          );
        }
        break;

      case QuizQuestionType.TRUE_FALSE:
        if (options.length < 2) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `True/false question "${question.questionText}" must have at least 2 options`,
            400,
          );
        }
        if (correctCount !== 1) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `True/false question "${question.questionText}" must have exactly one correct answer`,
            400,
          );
        }
        break;

      case QuizQuestionType.MULTIPLE_SELECT:
        if (options.length < 2) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `Multiple select question "${question.questionText}" must have at least 2 options`,
            400,
          );
        }
        if (correctCount < 1) {
          throw new BaseException(
            ERROR_CODES.COURSE_QUIZ_NOT_PUBLISHABLE,
            `Multiple select question "${question.questionText}" must have at least one correct answer`,
            400,
          );
        }
        break;
    }
  }
}
