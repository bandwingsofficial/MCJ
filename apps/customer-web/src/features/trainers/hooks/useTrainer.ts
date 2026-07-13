"use client";

import {
  useEffect,
  useState,
} from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

interface UseTrainerReturn {
  trainer: Trainer | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrainer(
  id: string,
): UseTrainerReturn {
  const [
    trainer,
    setTrainer,
  ] = useState<Trainer | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const fetchTrainer =
    async () => {
      if (!id) {
        setTrainer(null);
        setError(
          "Trainer ID is required",
        );
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        const data =
          await trainerService.getTrainer(
            id,
          );

        setTrainer(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch trainer",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchTrainer();
  }, [id]);

  return {
    trainer,
    isLoading,
    error,
    refetch:
      fetchTrainer,
  };
}