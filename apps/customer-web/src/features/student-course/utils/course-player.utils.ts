import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

/**
 * Returns all lessons in the order they should be consumed.
 */
export function flattenLessons(
  modules: CourseModule[],
): Lesson[] {
  return modules.flatMap(
    (module) => module.lessons,
  );
}

/**
 * Returns the first lesson in the course.
 */
export function getFirstLesson(
  modules: CourseModule[],
): Lesson | null {
  const lessons =
    flattenLessons(modules);

  return lessons[0] ?? null;
}

/**
 * Finds the index of a lesson.
 */
export function getLessonIndex(
  lessons: Lesson[],
  lessonId: string,
): number {
  return lessons.findIndex(
    (lesson) =>
      lesson.id === lessonId,
  );
}

/**
 * Returns a lesson by id.
 */
export function getLessonById(
  lessons: Lesson[],
  lessonId: string,
): Lesson | null {
  return (
    lessons.find(
      (lesson) =>
        lesson.id === lessonId,
    ) ?? null
  );
}

/**
 * Returns the previous lesson.
 */
export function getPreviousLesson(
  lessons: Lesson[],
  lessonId: string,
): Lesson | null {
  const index =
    getLessonIndex(
      lessons,
      lessonId,
    );

  if (index <= 0) {
    return null;
  }

  return lessons[index - 1];
}

/**
 * Returns the next lesson.
 */
export function getNextLesson(
  lessons: Lesson[],
  lessonId: string,
): Lesson | null {
  const index =
    getLessonIndex(
      lessons,
      lessonId,
    );

  if (
    index === -1 ||
    index >=
      lessons.length - 1
  ) {
    return null;
  }

  return lessons[index + 1];
}

/**
 * Returns the total number of lessons.
 */
export function getTotalLessons(
  modules: CourseModule[],
): number {
  return modules.reduce(
    (
      total,
      module,
    ) =>
      total +
      module.lessons.length,
    0,
  );
}