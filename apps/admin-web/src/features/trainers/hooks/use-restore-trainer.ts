"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UseRestoreTrainerReturn {
  isLoading: boolean;

  restoreTrainer: (
    id: string
  ) => Promise<boolean>;
}

export const useRestoreTrainer =
  (
    onSuccess?: () => void
  ): UseRestoreTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const restoreTrainer =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.restoreTrainer(
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
              : "Failed to restore trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      restoreTrainer,
    };
  };