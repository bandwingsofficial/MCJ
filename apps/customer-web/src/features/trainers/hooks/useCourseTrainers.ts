"use client";

import { useQuery } from "@tanstack/react-query";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

const COURSE_TRAINERS_QUERY_KEY = "course-trainers";

export function useCourseTrainers(courseId: string) {
  return useQuery({
    queryKey: [COURSE_TRAINERS_QUERY_KEY, courseId],
    queryFn: () => trainerService.getCourseTrainers(courseId),
    enabled: Boolean(courseId),
    staleTime: 1000 * 60 * 5,
  });
}
