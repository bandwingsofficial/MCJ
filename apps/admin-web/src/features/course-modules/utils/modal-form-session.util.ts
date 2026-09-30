import type { CourseLesson } from "@/src/features/course-lessons/types";
import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

export function moduleFormSessionEntity(
  module: CourseModule | null | undefined,
): { id: string; updatedAt: string | Date | null | undefined } | undefined {
  if (!module) {
    return undefined;
  }

  return { id: module.id, updatedAt: module.updatedAt };
}

export function lessonFormSessionEntity(
  lesson: CourseLesson | null | undefined,
): { id: string; updatedAt: string | Date | null | undefined } | undefined {
  if (!lesson) {
    return undefined;
  }

  return { id: lesson.id, updatedAt: lesson.updatedAt };
}
