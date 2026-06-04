"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UseDeactivateTrainerReturn {
  isLoading: boolean;

  deactivateTrainer: (
    id: string
  ) => Promise<boolean>;
}

export const useDeactivateTrainer =
  (
    onSuccess?: () => void
  ): UseDeactivateTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deactivateTrainer =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.deactivateTrainer(
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
              : "Failed to deactivate trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      deactivateTrainer,
    };
  };