"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

import type {
  UpdateTrainerRequest,
} from "@/src/features/trainers/types/trainer.types";

interface UseUpdateTrainerReturn {
  isLoading: boolean;

  updateTrainer: (
    id: string,
    payload: UpdateTrainerRequest
  ) => Promise<boolean>;
}

export const useUpdateTrainer =
  (
    onSuccess?: () => void
  ): UseUpdateTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const updateTrainer =
      async (
        id: string,
        payload: UpdateTrainerRequest
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.updateTrainer(
              id,
              payload
            );

          appToast.success(
            response.message
          );

          onSuccess?.();

          return true;
        } catch (error) {
          appToast.error(
            error instanceof Error
              ? error.message
              : "Failed to update trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      updateTrainer,
    };
  };