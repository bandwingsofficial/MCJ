"use client";

import { useMemo } from "react";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

interface UseCourseModuleReturn {
  modules: CourseModule[];

  totalModules: number;

  totalLessons: number;
}

export function useCourseModule(
  modules: CourseModule[],
): UseCourseModuleReturn {
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

    return {
      modules,

      totalModules:
        modules.length,

      totalLessons,
    };
  }, [modules]);
}