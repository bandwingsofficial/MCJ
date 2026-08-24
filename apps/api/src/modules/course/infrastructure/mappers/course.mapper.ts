import {
  Course as PrismaCourse,
  CourseImage as PrismaCourseImage,
  CourseMaterial as PrismaCourseMaterial,
  Prisma,
} from '@prisma/client';
import { CourseBranch as PrismaCourseBranch } from '@prisma/client';

import { CourseImage } from '../../domain/entities/course-image.entity';
import { CourseMaterial } from '../../domain/entities/course-material.entity';
import { Course } from '../../domain/entities/course.entity';
import { CourseLevel } from '../../domain/enums/course-level.enum';
import { CourseMode } from '../../domain/enums/course-mode.enum';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import { DurationType } from '../../domain/enums/duration-type.enum';
import { MaterialType } from '../../domain/enums/material-type.enum';

export type CourseWithRelations = PrismaCourse & {
  images: PrismaCourseImage[];
  materials: PrismaCourseMaterial[];
  courseBranches: PrismaCourseBranch[];
};

export class CourseMapper {
  static toDomain(record: CourseWithRelations): Course {
    return Course.reconstitute({
      id: record.id,
      code: record.code,
      title: record.title,
      slug: record.slug,
      tagline: record.tagline,
      shortDescription: record.shortDescription,
      description: record.description,
      thumbnailFileId: record.thumbnailFileId,
      thumbnailUrl: record.thumbnailUrl,
      originalPrice: Number(record.originalPrice),
      discountAmount: Number(record.discountAmount),
      discountedPrice: Number(record.discountedPrice),
      currency: record.currency,
      isFree: record.isFree,
      duration: record.duration,
      durationType: record.durationType as DurationType | null,
      level: record.level as CourseLevel,
      modes: record.mode as CourseMode[],
      language: record.language,
      averageRating: record.averageRating,
      totalReviews: record.totalReviews,
      isFeatured: record.isFeatured,
      isPopular: record.isPopular,
      displayOrder: record.displayOrder,
      metaTitle: record.metaTitle,
      metaDescription: record.metaDescription,
      metaKeywords: record.metaKeywords,
      categoryId: record.categoryId,
      branchIds:
  record.courseBranches?.map(
    (courseBranch) => courseBranch.branchId,
  ) ?? [],
      status: record.status as CourseStatus,
      images: record.images.map((image) =>
        new CourseImage(
          image.id,
          image.courseId,
          image.fileId,
          image.displayOrder,
          image.createdAt,
          image.updatedAt,
        ),
      ),
      materials: record.materials.map((material) =>
        new CourseMaterial(
          material.id,
          material.courseId,
          material.title,
          material.type as MaterialType,
          material.fileId,
          material.externalUrl,
          material.displayOrder ,
          material.createdAt,
          material.updatedAt,
        ),
      ),
      createdBy: record.createdBy,
      updatedBy: record.updatedBy,
      isDeleted: record.isDeleted,
      deletedAt: record.deletedAt,
      deletedBy: record.deletedBy,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }

  static toPersistence(
    course: Course,
  ): Prisma.CourseUncheckedCreateInput {
    return {
      id: course.id,
      code: course.code,
      title: course.title.getValue(),
      slug: course.slug.getValue(),
      tagline: course.tagline,
      shortDescription: course.shortDescription.getValue(),
      description: course.description,
      thumbnailFileId: course.thumbnailFileId,
      thumbnailUrl: course.thumbnailUrl,
      originalPrice: course.originalPrice.getValue(),
      discountAmount: course.discountAmount.getValue(),
      discountedPrice: course.discountedPrice.getValue(),
      currency: course.currency,
      isFree: course.isFree,
      duration: course.duration.getValue(),
      durationType: course.durationType,
      level: course.level,
      mode: course.modes,
      language: course.language,
      averageRating: course.averageRating,
      totalReviews: course.totalReviews,
      isFeatured: course.isFeatured,
      isPopular: course.isPopular,
      displayOrder: course.displayOrder,
      metaTitle: course.metaTitle,
      metaDescription: course.metaDescription,
      metaKeywords: course.metaKeywords,
      categoryId: course.categoryId,
      status: course.status,
      createdBy: course.createdBy,
      updatedBy: course.updatedBy,
      isDeleted: course.isDeleted,
      deletedAt: course.deletedAt,
      deletedBy: course.deletedBy,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
    };
  }
}
