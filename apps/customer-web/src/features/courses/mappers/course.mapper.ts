// src/features/courses/mappers/course.mapper.ts

import type {
  Course,
  CourseDto,
  CoursePreviewModule,
} from "@/src/features/courses/types/course.types";

function resolvePreviewModules(
  dto: CourseDto,
): CoursePreviewModule[] {
  return (dto.previewModules ?? [])
    .map((module) => ({
      id: module.id,
      title: module.title,
      description: module.description ?? null,
      displayOrder: module.displayOrder,
      keySkills: Array.isArray(module.keySkills) ? module.keySkills : [],
      lessons: [...(module.lessons ?? [])].sort(
        (a, b) => a.displayOrder - b.displayOrder,
      ),
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
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
    duration: dto.duration,
    durationType: dto.durationType,
    level: dto.level,
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
    previewLessonCount: dto.previewLessonCount ?? 0,
    isEnrolled: dto.isEnrolled ?? null,
    isAdmitted: dto.isAdmitted ?? null,
    updatedAt: dto.updatedAt ?? null,
    status: dto.status ?? null,
  };
}

export function mapCourseDtosToCourses(dtos: CourseDto[]): Course[] {
  return dtos.map(mapCourseDtoToCourse);
}
