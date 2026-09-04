import { CourseLevel } from '../../domain/enums/course-level.enum';
import { CourseQualification } from '../../domain/enums/course-qualification.enum';
import { DurationType } from '../../domain/enums/duration-type.enum';

import type {
  CourseImageInput,
  CourseMaterialInput,
} from '../create-course/create-course.command';

export class UpdateCourseCommand {
  constructor(
    public readonly id: string,
    public readonly title?: string,
    public readonly categoryId?: string,
    public readonly slug?: string,
    public readonly tagline?: string | null,
    public readonly shortDescription?: string | null,
    public readonly description?: string | null,
    public readonly thumbnailFileId?: string | null,
    public readonly duration?: number | null,
    public readonly durationType?: DurationType | null,
    public readonly level?: CourseLevel,

    public readonly minimumQualifications?: CourseQualification[],

    public readonly language?: string,
    public readonly averageRating?: number,
    public readonly totalReviews?: number,
    public readonly isFeatured?: boolean,
    public readonly isPopular?: boolean,
    public readonly displayOrder?: number,
    public readonly metaTitle?: string | null,
    public readonly metaDescription?: string | null,
    public readonly metaKeywords?: string | null,

    // updated
    public readonly branchIds?: string[],

    public readonly images?: CourseImageInput[],
    public readonly materials?: CourseMaterialInput[],
    public readonly updatedBy?: string,
    public readonly trainerIds?: string[],
  ) {}
}