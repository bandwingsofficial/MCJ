"use client";

import { useMemo } from "react";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

interface CourseProgress {
  totalModules: number;

  totalLessons: number;

  totalResources: number;

  progressPercentage: number;
}

export function useCourseProgress(
  modules: CourseModule[],
): CourseProgress {
  return useMemo(() => {
    const totalLessons =
      modules.reduce(
        (
          total,
          module,
        ) =>
          total +
          module.lessons.length,
        0,
      );

    const totalResources =
      modules.reduce(
        (
          moduleTotal,
          module,
        ) =>
          moduleTotal +
          module.lessons.reduce(
            (
              lessonTotal,
              lesson,
            ) =>
              lessonTotal +
              lesson.resources.length,
            0,
          ),
        0,
      );

    return {
      totalModules:
        modules.length,

      totalLessons,

      totalResources,

      /**
       * Placeholder until
       * backend progress tracking
       * is available.
       */
      progressPercentage: 0,
    };
  }, [modules]);
}