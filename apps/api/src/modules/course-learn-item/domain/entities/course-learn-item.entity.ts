import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export class CourseLearnItem {
  private constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public title: string,
    public explanation: string,
    public imageUrl: string | null,
    public keyLearningPoints: string | null,
    public finalThoughts: string | null,
    public summary: string | null,
    public displayOrder: number,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: CourseLearnItemCreateParams): CourseLearnItem {
    return new CourseLearnItem(
      params.id,
      params.lessonId,
      CourseLearnItem.normalizeRequiredText(params.title, 'Question/title'),
      CourseLearnItem.normalizeRequiredText(
        params.explanation,
        'Answer/explanation',
      ),
      CourseLearnItem.normalizeOptionalText(params.imageUrl),
      CourseLearnItem.normalizeOptionalText(params.keyLearningPoints),
      CourseLearnItem.normalizeOptionalText(params.finalThoughts),
      CourseLearnItem.normalizeOptionalText(params.summary),
      params.displayOrder ?? 0,
      params.createdBy ?? null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: CourseLearnItemReconstituteParams,
  ): CourseLearnItem {
    return new CourseLearnItem(
      params.id,
      params.lessonId,
      params.title,
      params.explanation,
      params.imageUrl,
      params.keyLearningPoints,
      params.finalThoughts,
      params.summary,
      params.displayOrder,
      params.createdBy,
      params.updatedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CourseLearnItemUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseLearnItem.normalizeRequiredText(
        params.title,
        'Question/title',
      );
    }

    if (params.explanation !== undefined) {
      this.explanation = CourseLearnItem.normalizeRequiredText(
        params.explanation,
        'Answer/explanation',
      );
    }

    if (params.imageUrl !== undefined) {
      this.imageUrl = CourseLearnItem.normalizeOptionalText(params.imageUrl);
    }

    if (params.keyLearningPoints !== undefined) {
      this.keyLearningPoints = CourseLearnItem.normalizeOptionalText(
        params.keyLearningPoints,
      );
    }

    if (params.finalThoughts !== undefined) {
      this.finalThoughts = CourseLearnItem.normalizeOptionalText(
        params.finalThoughts,
      );
    }

    if (params.summary !== undefined) {
      this.summary = CourseLearnItem.normalizeOptionalText(params.summary);
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  private static normalizeRequiredText(value: string, label: string): string {
    const normalized = value?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        `${label} is required`,
        400,
      );
    }

    return normalized;
  }

  private static normalizeOptionalText(
    value?: string | null,
  ): string | null {
    if (value === undefined || value === null) {
      return null;
    }

    const normalized = value.trim();
    return normalized.length ? normalized : null;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseLearnItemCreateParams {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  imageUrl?: string | null;
  keyLearningPoints?: string | null;
  finalThoughts?: string | null;
  summary?: string | null;
  displayOrder?: number;
  createdBy?: string | null;
}

export interface CourseLearnItemUpdateParams {
  title?: string;
  explanation?: string;
  imageUrl?: string | null;
  keyLearningPoints?: string | null;
  finalThoughts?: string | null;
  summary?: string | null;
  updatedBy?: string | null;
}

export interface CourseLearnItemReconstituteParams {
  id: string;
  lessonId: string;
  title: string;
  explanation: string;
  imageUrl: string | null;
  keyLearningPoints: string | null;
  finalThoughts: string | null;
  summary: string | null;
  displayOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
