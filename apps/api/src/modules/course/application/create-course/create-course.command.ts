import { CourseLevel } from '../../domain/enums/course-level.enum';
import { CourseMode } from '../../domain/enums/course-mode.enum';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import { DurationType } from '../../domain/enums/duration-type.enum';
import { MaterialType } from '../../domain/enums/material-type.enum';

export interface CourseImageInput {
  fileId: string;
  displayOrder?: number;
}

export interface CourseMaterialInput {
  title: string;
  type: MaterialType;
  fileId?: string | null;
  externalUrl?: string | null;
  displayOrder?: number;
}

export class CreateCourseCommand {
  constructor(
    public readonly title: string,
    public readonly categoryId: string,
    public readonly slug?: string,
    public readonly tagline?: string,
    public readonly shortDescription?: string,
    public readonly description?: string,
    public readonly thumbnailFileId?: string,
    public readonly originalPrice?: number,
    public readonly discountAmount?: number,
    public readonly discountedPrice?: number,
    public readonly currency?: string,
    public readonly isFree?: boolean,
    public readonly duration?: number,
    public readonly durationType?: DurationType,
    public readonly level?: CourseLevel,
    public readonly modes: CourseMode[] = [],
    public readonly language?: string,
    public readonly averageRating?: number,
    public readonly totalReviews?: number,
    public readonly isFeatured?: boolean,
    public readonly isPopular?: boolean,
    public readonly displayOrder?: number,
    public readonly metaTitle?: string,
    public readonly metaDescription?: string,
    public readonly metaKeywords?: string,

    // changed
    public readonly branchIds: string[] = [],

    public readonly status?: CourseStatus,
    public readonly images: CourseImageInput[] = [],
    public readonly materials: CourseMaterialInput[] = [],
    public readonly createdBy?: string,
  ) {}
}
