"use client";

import { useCallback, useEffect, useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

export function useCourseTrainers(courseId?: string) {
  const [trainers, setTrainers] = useState<TrainerDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!courseId) {
      setTrainers([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const assigned = await trainerService.getTrainersForCourse(courseId);
      setTrainers(assigned);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load course trainers",
      );
    } finally {
      setIsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    trainers,
    isLoading,
    error,
    refetch,
  };
}
