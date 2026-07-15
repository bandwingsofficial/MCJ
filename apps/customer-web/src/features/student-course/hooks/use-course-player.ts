"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  Lesson,
} from "@/src/features/student-course/types/lesson.types";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

import {
  flattenLessons,
  getFirstLesson,
  getLessonById,
  getLessonIndex,
  getNextLesson,
  getPreviousLesson,
} from "@/src/features/student-course/utils/course-player.utils";

interface UseCoursePlayerReturn {
  selectedLesson: Lesson | null;

  selectedLessonId: string | null;

  hasPreviousLesson: boolean;

  hasNextLesson: boolean;

  selectLesson: (
    lesson: Lesson,
  ) => void;

  goToPreviousLesson: () => void;

  goToNextLesson: () => void;
}

export function useCoursePlayer(
  modules: CourseModule[],
): UseCoursePlayerReturn {
  /**
   * Lessons in learning order.
   */
  const lessons = useMemo(
    () => flattenLessons(modules),
    [modules],
  );

  /**
   * Single source of truth.
   */
  const [
    selectedLessonId,
    setSelectedLessonId,
  ] = useState<string | null>(
    null,
  );

  /**
   * Auto-select the first lesson when the course loads
   * or when the currently selected lesson no longer exists.
   */
  useEffect(() => {
    const firstLesson =
      getFirstLesson(modules);

    if (!firstLesson) {
      setSelectedLessonId(null);

      return;
    }

    if (!selectedLessonId) {
      setSelectedLessonId(
        firstLesson.id,
      );

      return;
    }

    const lessonExists =
      getLessonById(
        lessons,
        selectedLessonId,
      );

    if (!lessonExists) {
      setSelectedLessonId(
        firstLesson.id,
      );
    }
  }, [
    lessons,
    modules,
    selectedLessonId,
  ]);

  /**
   * Currently selected lesson.
   */
  const selectedLesson =
    useMemo(() => {
      if (!selectedLessonId) {
        return null;
      }

      return getLessonById(
        lessons,
        selectedLessonId,
      );
    }, [
      lessons,
      selectedLessonId,
    ]);

  /**
   * Current lesson position.
   */
  const currentIndex =
    useMemo(() => {
      if (!selectedLessonId) {
        return -1;
      }

      return getLessonIndex(
        lessons,
        selectedLessonId,
      );
    }, [
      lessons,
      selectedLessonId,
    ]);

  const hasPreviousLesson =
    currentIndex > 0;

  const hasNextLesson =
    currentIndex >= 0 &&
    currentIndex <
      lessons.length - 1;

  const selectLesson =
    useCallback(
      (lesson: Lesson) => {
        setSelectedLessonId(
          lesson.id,
        );
      },
      [],
    );

  const goToPreviousLesson =
    useCallback(() => {
      if (
        !selectedLessonId
      ) {
        return;
      }

      const previousLesson =
        getPreviousLesson(
          lessons,
          selectedLessonId,
        );

      if (
        previousLesson
      ) {
        setSelectedLessonId(
          previousLesson.id,
        );
      }
    }, [
      lessons,
      selectedLessonId,
    ]);

  const goToNextLesson =
    useCallback(() => {
      if (
        !selectedLessonId
      ) {
        return;
      }

      const nextLesson =
        getNextLesson(
          lessons,
          selectedLessonId,
        );

      if (nextLesson) {
        setSelectedLessonId(
          nextLesson.id,
        );
      }
    }, [
      lessons,
      selectedLessonId,
    ]);

  return {
    selectedLesson,

    selectedLessonId,

    hasPreviousLesson,

    hasNextLesson,

    selectLesson,

    goToPreviousLesson,

    goToNextLesson,
  };
}