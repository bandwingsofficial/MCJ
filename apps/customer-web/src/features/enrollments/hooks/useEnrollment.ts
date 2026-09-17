"use client";

import { useQuery } from "@tanstack/react-query";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface UseEnrollmentResult {
  enrollment: Enrollment | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEnrollment(id: string): UseEnrollmentResult {
  const query = useQuery({
    queryKey: ["enrollment", id],
    queryFn: () => enrollmentService.getEnrollment(id),
    enabled: Boolean(id),
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });

  return {
    enrollment: query.data ?? null,
    isLoading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? "Failed to load enrollment."
          : null,
    refetch: async () => {
      await query.refetch();
    },
  };
}
