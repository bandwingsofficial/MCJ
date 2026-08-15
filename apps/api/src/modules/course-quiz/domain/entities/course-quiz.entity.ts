import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { QuizStatus } from '../enums/quiz-status.enum';

export class CourseQuiz {
  private constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public title: string,
    public description: string | null,
    public status: QuizStatus,
    public passingScore: number | null,
    public timeLimitMinutes: number | null,
    public displayOrder: number,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: CourseQuizCreateParams): CourseQuiz {
    return new CourseQuiz(
      params.id,
      params.lessonId,
      CourseQuiz.normalizeTitle(params.title),
      params.description ?? null,
      QuizStatus.DRAFT,
      params.passingScore ?? null,
      params.timeLimitMinutes ?? null,
      params.displayOrder ?? 0,
      params.createdBy ?? null,
      null,
      false,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: CourseQuizReconstituteParams,
  ): CourseQuiz {
    return new CourseQuiz(
      params.id,
      params.lessonId,
      params.title,
      params.description,
      params.status,
      params.passingScore,
      params.timeLimitMinutes,
      params.displayOrder,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CourseQuizUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseQuiz.normalizeTitle(params.title);
    }
    if (params.description !== undefined) {
      this.description = params.description;
    }
    if (params.passingScore !== undefined) {
      this.passingScore = params.passingScore;
    }
    if (params.timeLimitMinutes !== undefined) {
      this.timeLimitMinutes = params.timeLimitMinutes;
    }
    if (params.displayOrder !== undefined) {
      this.displayOrder = params.displayOrder;
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  publish(updatedBy?: string | null) {
    this.status = QuizStatus.PUBLISHED;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  revertToDraft(updatedBy?: string | null) {
    this.status = QuizStatus.DRAFT;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private static normalizeTitle(title: string): string {
    const normalized = title?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Quiz title is required',
        400,
      );
    }

    return normalized;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseQuizCreateParams {
  id: string;
  lessonId: string;
  title: string;
  description?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  displayOrder?: number;
  createdBy?: string | null;
}

export interface CourseQuizUpdateParams {
  title?: string;
  description?: string | null;
  passingScore?: number | null;
  timeLimitMinutes?: number | null;
  displayOrder?: number;
  updatedBy?: string | null;
}

export interface CourseQuizReconstituteParams {
  id: string;
  lessonId: string;
  title: string;
  description: string | null;
  status: QuizStatus;
  passingScore: number | null;
  timeLimitMinutes: number | null;
  displayOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
