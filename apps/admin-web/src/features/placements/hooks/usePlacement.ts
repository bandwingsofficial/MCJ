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

interface UsePlacementReturn {
  placement: Placement | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const usePlacement = (
  id: string,
): UsePlacementReturn => {
  const [
    placement,
    setPlacement,
  ] = useState<Placement | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchPlacement =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setIsLoading(true);

        setError(null);

        const response =
          await placementService.getPlacement(
            id,
          );

        setPlacement(response.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch placement";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchPlacement();
  }, [fetchPlacement]);

  return {
    placement,
    isLoading,
    error,
    refetch: fetchPlacement,
  };
};