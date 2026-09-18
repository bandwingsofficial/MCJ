// src/features/courses/mappers/course.mapper.ts

import { resolvePersistedImageUrl } from "@/src/shared/utils/image-url.util";

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
      lessons: [...(module.lessons ?? [])]
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          displayOrder: lesson.displayOrder,
          duration: lesson.duration ?? null,
          isPreview: lesson.isPreview,
          description: lesson.description ?? null,
          resourceCount: lesson.resourceCount ?? 0,
          hasQuiz: lesson.hasQuiz ?? false,
          learnItemCount: lesson.learnItemCount ?? 0,
          selfPacedVideoCount: lesson.selfPacedVideoCount ?? 0,
          liveRecordedVideoCount: lesson.liveRecordedVideoCount ?? 0,
        })),
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}

export function mapCourseDtoToCourse(dto: CourseDto): Course {
  return {
    id: dto.id,
    code: dto.code?.trim() || "",
    title: dto.title,
    slug: dto.slug,
    tagline: dto.tagline,
    shortDescription: dto.shortDescription,
    description: dto.description,
    thumbnailUrl: resolvePersistedImageUrl(
      dto.thumbnailUrl,
      dto.updatedAt ?? null,
    ),
    duration: dto.duration,
    durationType: dto.durationType,
    level: dto.level,
    language: dto.language,
    averageRating: dto.averageRating ?? 0,
    totalReviews: dto.totalReviews ?? 0,
    categoryId: dto.category?.id ?? dto.categoryId ?? "",
    categoryName: dto.category?.name?.trim() || "",
    branches: Array.isArray(dto.branches) ? dto.branches : [],
    isFeatured: dto.isFeatured ?? false,
    previewModules: resolvePreviewModules(dto),
    moduleCount: dto.moduleCount ?? dto.previewModules?.length ?? 0,
    lessonCount: dto.lessonCount ?? 0,
    previewLessonCount: dto.previewLessonCount ?? 0,
    resourceCount: dto.resourceCount ?? 0,
    quizCount: dto.quizCount ?? 0,
    selfPacedVideoCount: dto.selfPacedVideoCount ?? 0,
    liveRecordedVideoCount: dto.liveRecordedVideoCount ?? 0,
    isEnrolled: dto.isEnrolled ?? null,
    isAdmitted: dto.isAdmitted ?? null,
    updatedAt: dto.updatedAt ?? null,
    status: dto.status ?? null,
  };
}

export function mapCourseDtosToCourses(dtos: CourseDto[]): Course[] {
  const seen = new Set<string>();

  return dtos
    .filter((dto) => {
      if (!dto?.id || seen.has(dto.id)) {
        return false;
      }

      seen.add(dto.id);
      return true;
    })
    .map(mapCourseDtoToCourse);
}
