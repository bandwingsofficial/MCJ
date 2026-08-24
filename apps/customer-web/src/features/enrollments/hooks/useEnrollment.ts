"use client";

import { useCallback, useEffect, useState } from "react";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

interface UseEnrollmentResult {
  enrollment: Enrollment | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEnrollment(id: string): UseEnrollmentResult {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnrollment = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await enrollmentService.getEnrollment(id);
      setEnrollment(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load enrollment.",
      );
      setEnrollment(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchEnrollment();
  }, [fetchEnrollment]);

  return {
    enrollment,
    isLoading,
    error,
    refetch: fetchEnrollment,
  };
}
