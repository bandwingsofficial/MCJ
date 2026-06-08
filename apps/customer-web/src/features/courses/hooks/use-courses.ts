// src/features/courses/hooks/use-courses.ts

import { useQuery } from "@tanstack/react-query";

import {
  COURSE_QUERY_KEYS,
} from "@/src/features/courses/constants/course.constants";

import {
  getCourses,
} from "@/src/features/courses/services/course.service";

import type {
  GetCoursesParams,
} from "@/src/features/courses/types/course.types";

export function useCourses(
  params?: GetCoursesParams
) {
  return useQuery({
    queryKey:
      COURSE_QUERY_KEYS.list(
        params?.search,
        params?.categoryId,
        params?.branchId,
        params?.isFeatured
      ),

    queryFn: () =>
      getCourses(params),

    staleTime:
      1000 * 60 * 5,
  });
}