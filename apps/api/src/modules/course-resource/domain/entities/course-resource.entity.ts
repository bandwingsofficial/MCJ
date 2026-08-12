import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { ResourceType } from '../enums/resource-type.enum';

export class CourseResource {
  private constructor(
    public readonly id: string,
    public readonly lessonId: string,
    public title: string,
    public type: ResourceType,
    public fileUrl: string | null,
    public displayOrder: number,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    params: CourseResourceCreateParams,
  ): CourseResource {
    return new CourseResource(
      params.id,
      params.lessonId,
      CourseResource.normalizeTitle(params.title),
      params.type ?? ResourceType.OTHER,
      params.fileUrl ?? null,
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
    params: CourseResourceReconstituteParams,
  ): CourseResource {
    return new CourseResource(
      params.id,
      params.lessonId,
      params.title,
      params.type,
      params.fileUrl,
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

  update(params: CourseResourceUpdateParams) {
    if (params.title !== undefined) {
      this.title = CourseResource.normalizeTitle(params.title);
    }
    if (params.type !== undefined) {
      this.type = params.type;
    }
    if (params.fileUrl !== undefined) {
      this.fileUrl = params.fileUrl;
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
        'Resource title is required',
        400,
      );
    }

    return normalized;
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CourseResourceCreateParams {
  id: string;
  lessonId: string;
  title: string;
  type?: ResourceType;
  fileUrl?: string | null;
  displayOrder?: number;
  createdBy?: string | null;
}

export interface CourseResourceUpdateParams {
  title?: string;
  type?: ResourceType;
  fileUrl?: string | null;
  updatedBy?: string | null;
}

export interface CourseResourceReconstituteParams {
  id: string;
  lessonId: string;
  title: string;
  type: ResourceType;
  fileUrl: string | null;
  displayOrder: number;
  createdBy: string | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
