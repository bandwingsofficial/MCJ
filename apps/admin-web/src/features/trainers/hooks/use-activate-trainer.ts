"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UseActivateTrainerReturn {
  isLoading: boolean;

  activateTrainer: (
    id: string
  ) => Promise<boolean>;
}

export const useActivateTrainer =
  (
    onSuccess?: () => void
  ): UseActivateTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const activateTrainer =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.activateTrainer(
              id
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
              : "Failed to activate trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      activateTrainer,
    };
  };