// src/features/courses/mappers/course.mapper.ts

import type {
  Course,
  CourseDto,
} from "@/src/features/courses/types/course.types";

export function mapCourseDtoToCourse(
  dto: CourseDto
): Course {
  return {
    id: dto.id,

    title: dto.title,

    slug: dto.slug,

    tagline: dto.tagline,

    shortDescription:
      dto.shortDescription,

    thumbnailUrl:
      dto.thumbnailUrl,

    originalPrice:
      dto.originalPrice,

    discountPrice:
      dto.discountPrice,

    totalDiscount:
      dto.totalDiscount,

    currency:
      dto.currency,

    isFree:
      dto.isFree,

    level:
      dto.level,

    mode:
      dto.mode,

    language:
      dto.language,

    averageRating:
      dto.averageRating,

    totalReviews:
      dto.totalReviews,

    categoryId:
      dto.categoryId,

    isFeatured:
      dto.isFeatured,
  };
}

export function mapCourseDtosToCourses(
  dtos: CourseDto[]
): Course[] {
  return dtos.map(
    mapCourseDtoToCourse
  );
}