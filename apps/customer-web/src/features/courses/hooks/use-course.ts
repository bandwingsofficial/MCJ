// src/features/courses/hooks/use-course.ts

import { useQuery } from "@tanstack/react-query";

import {
  COURSE_QUERY_KEYS,
} from "@/src/features/courses/constants/course.constants";

import {
  getCourseBySlug,
} from "@/src/features/courses/services/course.service";

export function useCourse(
  slug: string
) {
  return useQuery({
    queryKey:
      COURSE_QUERY_KEYS.detail(
        slug
      ),

    queryFn: () =>
      getCourseBySlug(slug),

    enabled:
      Boolean(slug),

    staleTime:
      1000 * 60 * 5,
  });
}