"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { placementService } from "@/src/features/placements/services/placement.service";

import type {
  Placement,
} from "@/src/features/placements/types/placement.types";

export interface PlacementFilters {
  search: string;
}

interface UsePlacementsReturn {
  placements: Placement[];

  isLoading: boolean;

  error: string | null;

  filters: PlacementFilters;

  setFilters: (
    filters: PlacementFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const usePlacements =
  (): UsePlacementsReturn => {
    const [
      placements,
      setPlacements,
    ] = useState<Placement[]>([]);

    const [
      isLoading,
      setIsLoading,
    ] = useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<PlacementFilters>({
        search: "",
      });

    const fetchPlacements =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await placementService.getPlacements();

          setPlacements(response.data);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch placements";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchPlacements();
    }, [fetchPlacements]);

    return {
      placements,
      isLoading,
      error,
      filters,
      setFilters,
      refetch: fetchPlacements,
    };
  };