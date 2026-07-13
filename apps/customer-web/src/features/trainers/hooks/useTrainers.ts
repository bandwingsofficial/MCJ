"use client";

import {
  useEffect,
  useState,
} from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

export function useTrainers() {
  const [
    trainers,
    setTrainers,
  ] = useState<Trainer[]>([]);

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

  const fetchTrainers =
    async () => {
      try {
        setIsLoading(true);

        const data =
          await trainerService.getTrainers();

        setTrainers(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch trainers",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchTrainers();
  }, []);

  return {
    trainers,
    isLoading,
    error,
    refetch:
      fetchTrainers,
  };
}