import { useQuery } from "@tanstack/react-query";

import { COURSE_QUERY_KEYS } from "@/src/features/courses/constants/course.constants";
import {
  getCourse,
  getCourseSummary,
} from "@/src/features/courses/services/course.service";

export function useCourse(identifier: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(identifier),
    queryFn: () => getCourse(identifier),
    enabled: Boolean(identifier),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCourseSummary(courseId?: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.summary(courseId ?? ""),
    queryFn: () => getCourseSummary(courseId!),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 5,
  });
}
