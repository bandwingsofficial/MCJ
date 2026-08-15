import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { QuizQuestionType } from '../enums/quiz-question-type.enum';
import {
  CourseQuizOption,
  CourseQuizOptionCreateParams,
} from './course-quiz-option.entity';

export class CourseQuizQuestion {
  private constructor(
    public readonly id: string,
    public readonly quizId: string,
    public questionText: string,
    public type: QuizQuestionType,
    public explanation: string | null,
    public points: number,
    public displayOrder: number,
    public options: CourseQuizOption[],
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    params: CourseQuizQuestionCreateParams,
  ): CourseQuizQuestion {
    const options = (params.options ?? []).map((option, index) =>
      CourseQuizOption.create({
        id: option.id,
        questionId: params.id,
        optionText: option.optionText,
        isCorrect: option.isCorrect,
        displayOrder: option.displayOrder ?? index,
      }),
    );

    return new CourseQuizQuestion(
      params.id,
      params.quizId,
      CourseQuizQuestion.normalizeQuestionText(params.questionText),
      params.type ?? QuizQuestionType.MULTIPLE_CHOICE,
      params.explanation ?? null,
      params.points ?? 1,
      params.displayOrder ?? 0,
      options,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: CourseQuizQuestionReconstituteParams,
  ): CourseQuizQuestion {
    return new CourseQuizQuestion(
      params.id,
      params.quizId,
      params.questionText,
      params.type,
      params.explanation,
      params.points,
      params.displayOrder,
      params.options,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CourseQuizQuestionUpdateParams) {
    if (params.questionText !== undefined) {
      this.questionText = CourseQuizQuestion.normalizeQuestionText(
        params.questionText,
      );
    }
    if (params.type !== undefined) {
      this.type = params.type;
    }
    if (params.explanation !== undefined) {
      this.explanation = params.explanation;
    }
    if (params.points !== undefined) {
      this.points = params.points;
    }
    if (params.displayOrder !== undefined) {
      this.displayOrder = params.displayOrder;
    }
    if (params.options !== undefined) {
      this.options = params.options.map((option, index) =>
        CourseQuizOption.create({
          id: option.id,
          questionId: this.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          displayOrder: option.displayOrder ?? index,
        }),
      );
    }

    this.touch();
  }

  moveTo(displayOrder: number) {
    this.displayOrder = displayOrder;
    this.touch();
  }

  private static normalizeQuestionText(questionText: string): string {
    const normalized = questionText?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Question text is required',
        400,
      );
    }

    return normalized;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseQuizQuestionOptionInput {
  id: string;
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export interface CourseQuizQuestionCreateParams {
  id: string;
  quizId: string;
  questionText: string;
  type?: QuizQuestionType;
  explanation?: string | null;
  points?: number;
  displayOrder?: number;
  options?: CourseQuizQuestionOptionInput[];
}

export interface CourseQuizQuestionUpdateParams {
  questionText?: string;
  type?: QuizQuestionType;
  explanation?: string | null;
  points?: number;
  displayOrder?: number;
  options?: CourseQuizQuestionOptionInput[];
}

export interface CourseQuizQuestionReconstituteParams {
  id: string;
  quizId: string;
  questionText: string;
  type: QuizQuestionType;
  explanation: string | null;
  points: number;
  displayOrder: number;
  options: CourseQuizOption[];
  createdAt: Date;
  updatedAt: Date;
}

export type CourseQuizOptionInputParams = Omit<
  CourseQuizOptionCreateParams,
  'questionId'
>;
