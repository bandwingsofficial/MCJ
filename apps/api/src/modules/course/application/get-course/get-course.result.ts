import { Course } from '../../domain/entities/course.entity';
import { CourseLevel } from '../../domain/enums/course-level.enum';
import { CourseMode } from '../../domain/enums/course-mode.enum';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import { DurationType } from '../../domain/enums/duration-type.enum';
import { MaterialType } from '../../domain/enums/material-type.enum';

export class CourseImageResult {
  constructor(
    public readonly id: string,
    public readonly fileId: string,
    public readonly displayOrder: number | null,
  ) {}
}

export class CourseBranchResult {
  constructor(
    public readonly id: string,
    public readonly branchName: string,
    public readonly branchCode: string,
  ) {}
}

export class CourseCategoryResult {
  constructor(
    public readonly id: string,
    public readonly name: string,
  ) {}
}

export class CourseMaterialResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: MaterialType,
    public readonly fileId: string | null,
    public readonly externalUrl: string | null,
    public readonly displayOrder: number | null,
  ) {}
}

export class CourseResourcePreviewResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: string,
    public readonly displayOrder: number,
  ) {}
}

export class CourseLessonPreviewResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly isPreview: boolean,
    public readonly duration: number | null,
    public readonly displayOrder: number,
    public readonly description?: string | null,
    public readonly videoUrl?: string | null,
  ) {}
}

export class CourseModulePreviewResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly displayOrder: number,
    public readonly lessons: CourseLessonPreviewResult[],
    public readonly keySkills: string[] = [],
  ) {}
}

export class CourseResourceTreeResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly type: string,
    public readonly fileUrl: string | null,
    public readonly displayOrder: number,
  ) {}
}

export class CourseLessonTreeResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly videoUrl: string | null,
    public readonly duration: number | null,
    public readonly displayOrder: number,
    public readonly isPreview: boolean,
    public readonly resources: CourseResourceTreeResult[],
  ) {}
}

export class CourseModuleTreeResult {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string | null,
    public readonly keySkills: string[],
    public readonly displayOrder: number,
    public readonly lessons: CourseLessonTreeResult[],
  ) {}
}

export class CoursePricingResult {
  constructor(
    public readonly originalPrice: number,
    public readonly discountAmount: number,
    public readonly discountPercent: number,
    public readonly discountedPrice: number,
    public readonly currency: string,
    public readonly isFree: boolean,
  ) {}
}

export class GetCourseResult {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly title: string,
    public readonly slug: string,
    public readonly tagline: string | null,
    public readonly shortDescription: string | null,
    public readonly description: string | null,
    public readonly thumbnailFileId: string | null,
    public readonly thumbnailUrl: string | null,
    public readonly pricing: CoursePricingResult,
    public readonly duration: number | null,
    public readonly durationType: DurationType | null,
    public readonly level: CourseLevel,
    public readonly modes: CourseMode[],
    public readonly language: string,
    public readonly averageRating: number,
    public readonly totalReviews: number,
    public readonly isFeatured: boolean,
    public readonly isPopular: boolean,
    public readonly displayOrder: number | null,
    public readonly metaTitle: string | null,
    public readonly metaDescription: string | null,
    public readonly metaKeywords: string | null,
    public readonly categoryId: string,
    public readonly category: CourseCategoryResult | null,
    public readonly branches: CourseBranchResult[],
    public readonly status: CourseStatus,
    public readonly images: CourseImageResult[],
    public readonly materials: CourseMaterialResult[],
    public readonly modules: CourseModuleTreeResult[],
    public readonly previewModules: CourseModulePreviewResult[],
    public readonly moduleCount: number,
    public readonly lessonCount: number,
    public readonly previewLessonCount: number,
    public readonly isEnrolled: boolean | null,
    public readonly isAdmitted: boolean | null,
    public readonly createdBy: string | null,
    public readonly updatedBy: string | null,
    public readonly isDeleted: boolean,
    public readonly deletedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly categoryName?: string | null,
  ) {}

  static fromEntity(
    course: Course,
    branches: CourseBranchResult[],
    options: {
      modules?: CourseModuleTreeResult[];
      previewModules?: CourseModulePreviewResult[];
      moduleCount?: number;
      lessonCount?: number;
      previewLessonCount?: number;
      isEnrolled?: boolean | null;
      isAdmitted?: boolean | null;
      publicView?: boolean;
      categoryName?: string | null;
      category?: CourseCategoryResult | null;
    } = {},
  ): GetCourseResult {
    const publicView = options.publicView ?? false;
    const materials = publicView
      ? course.materials
          .filter((material) => !material.fileId && material.externalUrl)
          .map(
            (material) =>
              new CourseMaterialResult(
                material.id,
                material.title,
                material.type,
                null,
                material.externalUrl,
                material.displayOrder ?? null,
              ),
          )
      : course.materials.map(
          (material) =>
            new CourseMaterialResult(
              material.id,
              material.title,
              material.type,
              material.fileId,
              material.externalUrl,
              material.displayOrder ?? null,
            ),
        );

    const category =
      options.category ??
      (options.categoryName
        ? new CourseCategoryResult(
            course.categoryId,
            options.categoryName,
          )
        : null);

    const pricing = course.getPricing();

    return new GetCourseResult(
      course.id,
      course.code,
      course.title.getValue(),
      course.slug.getValue(),
      course.tagline,
      course.shortDescription.getValue(),
      course.description,
      course.thumbnailFileId,
      course.thumbnailUrl,
      new CoursePricingResult(
        pricing.originalPrice,
        pricing.discountAmount,
        pricing.discountPercent,
        pricing.discountedPrice,
        pricing.currency,
        pricing.isFree,
      ),
      course.duration.getValue(),
      course.durationType,
      course.level,
      course.modes,
      course.language,
      course.averageRating,
      course.totalReviews,
      course.isFeatured,
      course.isPopular,
      course.displayOrder ?? null,
      course.metaTitle,
      course.metaDescription,
      course.metaKeywords,
      course.categoryId,
      category,
      branches,
      course.status,
      course.images.map(
        (image) =>
          new CourseImageResult(
            image.id,
            image.fileId,
            image.displayOrder ?? null,
          ),
      ),
      materials,
      publicView ? [] : (options.modules ?? []),
      options.previewModules ?? [],
      options.moduleCount ?? options.previewModules?.length ?? 0,
      options.lessonCount ?? 0,
      options.previewLessonCount ?? 0,
      options.isEnrolled ?? null,
      options.isAdmitted ?? null,
      course.createdBy,
      course.updatedBy,
      course.isDeleted,
      course.deletedAt,
      course.createdAt,
      course.updatedAt,
      options.categoryName,
    );
  }
}