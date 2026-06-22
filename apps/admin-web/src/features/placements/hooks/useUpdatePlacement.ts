"use client";

import { useState } from "react";

import { placementService } from "@/src/features/placements/services/placement.service";

import type {
  Placement,
  UpdatePlacementRequest,
} from "@/src/features/placements/types/placement.types";

interface UseUpdatePlacementReturn {
  isUpdating: boolean;

  error: string | null;

  updatePlacement: (
    id: string,
    payload: UpdatePlacementRequest,
  ) => Promise<Placement | null>;
}

export const useUpdatePlacement =
  (): UseUpdatePlacementReturn => {
    const [
      isUpdating,
      setIsUpdating,
    ] = useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const updatePlacement =
      async (
        id: string,
        payload: UpdatePlacementRequest,
      ): Promise<Placement | null> => {
        try {
          setIsUpdating(true);

          setError(null);

          const response =
            await placementService.updatePlacement(
              id,
              payload,
            );

          return response.data;
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to update placement";

          setError(message);

          return null;
        } finally {
          setIsUpdating(false);
        }
      };

    return {
      isUpdating,
      error,
      updatePlacement,
    };
  };