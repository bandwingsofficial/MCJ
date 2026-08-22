// src/features/courses/mappers/course.mapper.ts

import type {
  Course,
  CourseDto,
  CourseMode,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";

function resolveMode(dto: CourseDto): CourseMode {
  if (dto.modes?.length) {
    return dto.modes[0];
  }

  return dto.mode ?? "ONLINE";
}

function resolvePreviewModules(
  dto: CourseDto,
): CoursePreviewModule[] {
  return (dto.previewModules ?? []).map((module) => ({
    ...module,
    lessons: [...(module.lessons ?? [])].sort(
      (a, b) => a.displayOrder - b.displayOrder,
    ),
  })).sort((a, b) => a.displayOrder - b.displayOrder);
}

export function mapCourseDtoToCourse(dto: CourseDto): Course {
  return {
    id: dto.id,
    code: dto.code ?? "—",
    title: dto.title,
    slug: dto.slug,
    tagline: dto.tagline,
    shortDescription: dto.shortDescription,
    description: dto.description,
    thumbnailUrl: dto.thumbnailUrl,
    originalPrice: dto.originalPrice ?? 0,
    discountPrice: dto.discountPrice ?? 0,
    totalDiscount: dto.totalDiscount ?? 0,
    currency: dto.currency ?? "INR",
    isFree: dto.isFree ?? false,
    duration: dto.duration,
    durationType: dto.durationType,
    level: dto.level,
    mode: resolveMode(dto),
    language: dto.language,
    averageRating: dto.averageRating ?? 0,
    totalReviews: dto.totalReviews ?? 0,
    categoryId: dto.category?.id ?? dto.categoryId ?? "",
    categoryName: dto.category?.name ?? "General",
    branches: dto.branches ?? [],
    isFeatured: dto.isFeatured ?? false,
    previewModules: resolvePreviewModules(dto),
    moduleCount: dto.moduleCount ?? dto.previewModules?.length ?? 0,
    lessonCount: dto.lessonCount ?? 0,
  };
}

export function mapCourseDtosToCourses(dtos: CourseDto[]): Course[] {
  return dtos.map(mapCourseDtoToCourse);
}
