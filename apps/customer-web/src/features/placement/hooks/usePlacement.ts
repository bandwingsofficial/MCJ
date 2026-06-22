"use client";

import {
  useEffect,
  useState,
} from "react";

import { placementService } from "@/src/features/placement/services/placement.service";

import type {
  Placement,
} from "@/src/features/placement/types/placement.types";

export function usePlacement() {
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

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const fetchPlacement =
    async () => {
      try {
        setIsLoading(true);

        const data =
          await placementService.getPlacement();

        setPlacement(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch placement",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchPlacement();
  }, []);

  return {
    placement,
    isLoading,
    error,
    refetch:
      fetchPlacement,
  };
}