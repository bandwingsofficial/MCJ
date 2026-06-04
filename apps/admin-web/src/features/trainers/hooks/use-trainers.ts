"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  TrainerFilters,
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

interface UseTrainersReturn {
  trainers: TrainerListItem[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: TrainerFilters;

  setFilters: (
    filters: TrainerFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useTrainers =
  (): UseTrainersReturn => {
    const [
      trainers,
      setTrainers,
    ] = useState<
      TrainerListItem[]
    >([]);

    const [count, setCount] =
      useState(0);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(
        null
      );

    const [filters, setFilters] =
      useState<TrainerFilters>({
        search: "",

        branchId:
          undefined,

        trainerType:
          undefined,

        status:
          undefined,

        includeDeleted:
          false,

        skip: 0,

        take: 10,
      });

    const fetchTrainers =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await trainerService.getTrainers(
              filters
            );

          setTrainers(
            response.data
          );

          setCount(
            response.data.length
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch trainers";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchTrainers();
    }, [fetchTrainers]);

    return {
      trainers,

      count,

      isLoading,

      error,

      filters,

      setFilters,

      refetch:
        fetchTrainers,
    };
  };