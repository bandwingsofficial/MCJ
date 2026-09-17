"use client";

import { useQuery } from "@tanstack/react-query";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

import type {
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

export function useMyEnrollments() {
  const query = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentService.getMyEnrollments(),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });

  return {
    enrollments: (query.data ?? []) as Enrollment[],
    isLoading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? "Failed to fetch enrollments"
          : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
