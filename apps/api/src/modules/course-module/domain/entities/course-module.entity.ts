import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { Slug } from '@common/value-objects/slug.vo';

export class CourseModule {
  private constructor(
    public readonly id: string,
    public readonly courseId: string,
    public title: string,
    public slug: Slug,
    public description: string | null,
    public keySkills: string[],
    public thumbnailUrl: string | null,
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

  static create(params: CourseModuleCreateParams): CourseModule {
    return new CourseModule(
      params.id,
      params.courseId,
      CourseModule.normalizeTitle(params.title),
      params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title),
      params.description ?? null,
      params.keySkills ?? [],
      params.thumbnailUrl ?? null,
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
    params: CourseModuleReconstituteParams,
  ): CourseModule {
    return new CourseModule(
      params.id,
      params.courseId,
      params.title,
      Slug.create(params.slug),
      params.description,
      params.keySkills,
      params.thumbnailUrl,
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

  update(params: CourseModuleUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseModule.normalizeTitle(params.title);
      this.slug = params.slug
        ? Slug.create(params.slug)
        : Slug.fromTitle(params.title);
    } else if (params.slug !== undefined) {
      this.slug = Slug.create(params.slug);
    }

    if (params.description !== undefined) {
      this.description = params.description;
    }
    if (params.keySkills !== undefined) {
      this.keySkills = params.keySkills;
    }
    if (params.thumbnailUrl !== undefined) {
      this.thumbnailUrl = params.thumbnailUrl;
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
        'Module title is required',
        400,
      );
    }

    return normalized;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseModuleCreateParams {
  id: string;
  courseId: string;
  title: string;
  slug?: string;
  description?: string | null;
  keySkills?: string[];
  thumbnailUrl?: string | null;
  duration?: number | null;
  displayOrder?: number;
  createdBy?: string | null;
}

export interface CourseModuleUpdateParams {
  title?: string;
  slug?: string;
  description?: string | null;
  keySkills?: string[];
  thumbnailUrl?: string | null;
  duration?: number | null;
  updatedBy?: string | null;
}

export interface CourseModuleReconstituteParams {
  id: string;
  courseId: string;
  title: string;
  slug: string;
  description: string | null;
  keySkills: string[];
  thumbnailUrl: string | null;
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
