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
  params?: GetCoursesParams & { enabled?: boolean },
) {
  const { enabled = true, ...queryParams } = params ?? {};

  return useQuery({
    queryKey: COURSE_QUERY_KEYS.list(
      queryParams.search,
      queryParams.categoryId,
      queryParams.branchId,
      queryParams.isFeatured,
      queryParams.isPopular,
    ),

    queryFn: () => getCourses(queryParams),

    staleTime: 1000 * 60 * 5,
    enabled,
  });
}