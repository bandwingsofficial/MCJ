import { useQuery } from "@tanstack/react-query";

import { COURSE_QUERY_KEYS } from "@/src/features/courses/constants/course.constants";
import {
  getCourse,
  getCourseFaqs,
  getCourseSummary,
} from "@/src/features/courses/services/course.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

export function useCourse(identifier: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.detail(identifier),
    queryFn: () => getCourse(identifier),
    enabled: Boolean(identifier),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}

export function useCourseSummary(courseId?: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.summary(courseId ?? ""),
    queryFn: () => getCourseSummary(courseId!),
    enabled: Boolean(courseId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}

export function useCourseFaqs(courseId?: string) {
  return useQuery({
    queryKey: COURSE_QUERY_KEYS.faqs(courseId ?? ""),
    queryFn: () => getCourseFaqs(courseId!),
    enabled: Boolean(courseId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}
