import type {
  LessonTreeDto,
  ModuleTreeDto,
} from "@/src/features/learning/types/learning.types";

function compareDisplayOrder(
  left: number | null | undefined,
  right: number | null | undefined,
  leftIndex: number,
  rightIndex: number,
): number {
  const leftOrder = left ?? leftIndex;
  const rightOrder = right ?? rightIndex;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return leftIndex - rightIndex;
}

export function sortModules(modules: ModuleTreeDto[]): ModuleTreeDto[] {
  return modules
    .map((module, index) => ({ module, index }))
    .sort((left, right) =>
      compareDisplayOrder(
        left.module.displayOrder,
        right.module.displayOrder,
        left.index,
        right.index,
      ),
    )
    .map(({ module }) => ({
      ...module,
      lessons: sortLessons(module.lessons),
    }));
}

export function sortLessons(lessons: LessonTreeDto[]): LessonTreeDto[] {
  return lessons
    .map((lesson, index) => ({ lesson, index }))
    .sort((left, right) =>
      compareDisplayOrder(
        left.lesson.displayOrder,
        right.lesson.displayOrder,
        left.index,
        right.index,
      ),
    )
    .map(({ lesson }) => lesson);
}

export function flattenOrderedLessons(
  modules: ModuleTreeDto[],
): LessonTreeDto[] {
  return sortModules(modules).flatMap((module) => module.lessons);
}

export function getModuleOrdinal(
  modules: ModuleTreeDto[],
  moduleId: string,
): number | null {
  const sorted = sortModules(modules);
  const index = sorted.findIndex((module) => module.id === moduleId);
  return index >= 0 ? index + 1 : null;
}

export function getLessonOrdinal(
  module: ModuleTreeDto,
  lessonId: string,
): number | null {
  const sorted = sortLessons(module.lessons);
  const index = sorted.findIndex((lesson) => lesson.id === lessonId);
  return index >= 0 ? index + 1 : null;
}

export function formatModuleOrdinal(ordinal: number): string {
  return `Module ${String(ordinal).padStart(2, "0")}`;
}

export function formatLessonOrdinal(ordinal: number): string {
  return `Lesson ${String(ordinal).padStart(2, "0")}`;
}

export function findModuleForLessonOrdered(
  modules: ModuleTreeDto[],
  lessonId: string,
): ModuleTreeDto | null {
  return (
    sortModules(modules).find((module) =>
      module.lessons.some((lesson) => lesson.id === lessonId),
    ) ?? null
  );
}
