"use client";

import { useQuery } from "@tanstack/react-query";

import { trainerService } from "@/src/features/trainers/services/trainer.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

const COURSE_TRAINERS_QUERY_KEY = "course-trainers";

export function useCourseTrainers(courseId: string) {
  return useQuery({
    queryKey: [COURSE_TRAINERS_QUERY_KEY, courseId],
    queryFn: () => trainerService.getCourseTrainers(courseId),
    enabled: Boolean(courseId),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}
