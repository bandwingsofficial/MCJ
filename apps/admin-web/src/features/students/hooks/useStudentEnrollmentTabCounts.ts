"use client";

import { useCallback, useEffect, useState } from "react";

import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";

export function useStudentEnrollmentTabCounts(studentId: string) {
  const [counts, setCounts] = useState({
    all: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    if (!studentId) {
      setCounts({ all: 0, active: 0, completed: 0, cancelled: 0 });
      return;
    }

    try {
      setIsLoading(true);
      const data = await enrollmentService.getEnrollmentTabCounts({
        studentId,
      });
      setCounts({
        all: data.all ?? 0,
        active: data.active,
        completed: data.completed,
        cancelled: data.cancelled ?? 0,
      });
    } catch {
      setCounts({ all: 0, active: 0, completed: 0, cancelled: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  useRealtimeRefetch("enrollment", fetchCounts);
  useRealtimeRefetch("student", fetchCounts);

  return { counts, isLoading, refetch: fetchCounts };
}
