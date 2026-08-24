import type { CourseLesson } from "@/src/features/course-lessons/types";
import { filterNormalLessons } from "@/src/features/course-modules/hooks/use-module-content-data";
import { formatContentOrderNumber } from "@/src/shared/utils/content-order";

export function getOrderedPlainLessons(
  lessons: CourseLesson[],
  quizLessonIds: Set<string>,
  resourceShellLessonIds: Set<string>,
): CourseLesson[] {
  return filterNormalLessons(
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
  ).sort((a, b) => a.displayOrder - b.displayOrder);
}

/** 1-based position of a plain lesson within its module (not raw displayOrder). */
export function getPlainLessonPosition(
  lessons: CourseLesson[],
  lessonId: string,
  quizLessonIds: Set<string>,
  resourceShellLessonIds: Set<string>,
): number {
  const ordered = getOrderedPlainLessons(
    lessons,
    quizLessonIds,
    resourceShellLessonIds,
  );
  const index = ordered.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 ? index + 1 : 0;
}

export function formatLessonOrderLabel(position: number): string {
  if (position < 1) {
    return "—";
  }

  return formatContentOrderNumber(position);
}

export function formatModuleOrderLabel(displayOrder: number): string {
  return formatContentOrderNumber(displayOrder);
}
