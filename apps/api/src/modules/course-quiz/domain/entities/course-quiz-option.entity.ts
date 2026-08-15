import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseQuizOption {
  private constructor(
    public readonly id: string,
    public readonly questionId: string,
    public optionText: string,
    public isCorrect: boolean,
    public displayOrder: number,
  ) {}

  static create(
    params: CourseQuizOptionCreateParams,
  ): CourseQuizOption {
    return new CourseQuizOption(
      params.id,
      params.questionId,
      CourseQuizOption.normalizeOptionText(params.optionText),
      params.isCorrect ?? false,
      params.displayOrder ?? 0,
    );
  }

  static reconstitute(
    params: CourseQuizOptionReconstituteParams,
  ): CourseQuizOption {
    return new CourseQuizOption(
      params.id,
      params.questionId,
      params.optionText,
      params.isCorrect,
      params.displayOrder,
    );
  }

  update(params: CourseQuizOptionUpdateParams) {
    if (params.optionText !== undefined) {
      this.optionText = CourseQuizOption.normalizeOptionText(
        params.optionText,
      );
    }
    if (params.isCorrect !== undefined) {
      this.isCorrect = params.isCorrect;
    }
    if (params.displayOrder !== undefined) {
      this.displayOrder = params.displayOrder;
    }
  }

  private static normalizeOptionText(optionText: string): string {
    const normalized = optionText?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Option text is required',
        400,
      );
    }

    return normalized;
  }
}

export interface CourseQuizOptionCreateParams {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export interface CourseQuizOptionUpdateParams {
  optionText?: string;
  isCorrect?: boolean;
  displayOrder?: number;
}

export interface CourseQuizOptionReconstituteParams {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
}
