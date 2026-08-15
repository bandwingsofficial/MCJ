import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { Slug } from '@common/value-objects/slug.vo';

import { LessonContentType } from '../enums/lesson-content-type.enum';

export class CourseLesson {
  private constructor(
    public readonly id: string,
    public readonly moduleId: string,
    public title: string,
    public slug: Slug,
    public description: string | null,
    public videoUrl: string | null,
    public contentType: LessonContentType,
    public duration: number | null,
    public displayOrder: number,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: CourseLessonCreateParams): CourseLesson {
    return new CourseLesson(
      params.id,
      params.moduleId,
      CourseLesson.normalizeTitle(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      params.description ?? null,
      params.videoUrl ?? null,
      params.contentType ?? LessonContentType.LESSON,
      params.duration ?? null,
      params.displayOrder ?? 0,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: CourseLessonReconstituteParams,
  ): CourseLesson {
    return new CourseLesson(
      params.id,
      params.moduleId,
      params.title,
      Slug.create(params.slug),
      params.description,
      params.videoUrl,
      params.contentType,
      params.duration,
      params.displayOrder,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CourseLessonUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseLesson.normalizeTitle(params.title);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.description !== undefined) {
      this.description = params.description;
    }
    if (params.videoUrl !== undefined) {
      this.videoUrl = params.videoUrl;
    }
    if (params.contentType !== undefined) {
      this.contentType = params.contentType;
    }
    if (params.duration !== undefined) {
      this.duration = params.duration;
    }

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  moveTo(displayOrder: number, updatedBy?: string | null) {
    this.displayOrder = displayOrder;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private static normalizeTitle(title: string): string {
    const normalized = title?.trim();

    if (!normalized) {
      throw new BaseException(
        ERROR_CODES.VALIDATION_ERROR,
        'Lesson title is required',
        400,
      );
    }

    return normalized;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseLessonCreateParams {
  id: string;
  moduleId: string;
  title: string;
  slug?: string;
  description?: string | null;
  videoUrl?: string | null;
  contentType?: LessonContentType;
  duration?: number | null;
  displayOrder?: number;
  createdBy?: string | null;
}

export interface CourseLessonUpdateParams {
  title?: string;
  slug?: string;
  description?: string | null;
  videoUrl?: string | null;
  contentType?: LessonContentType;
  duration?: number | null;
  updatedBy?: string | null;
}

export interface CourseLessonReconstituteParams {
  id: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string | null;
  videoUrl: string | null;
  contentType: LessonContentType;
  duration: number | null;
  displayOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
