"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UsePermanentDeleteTrainerReturn {
  isLoading: boolean;

  permanentDeleteTrainer: (
    id: string
  ) => Promise<boolean>;
}

export const usePermanentDeleteTrainer =
  (
    onSuccess?: () => void
  ): UsePermanentDeleteTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const permanentDeleteTrainer =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.permanentDeleteTrainer(
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
              : "Failed to permanently delete trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      permanentDeleteTrainer,
    };
  };