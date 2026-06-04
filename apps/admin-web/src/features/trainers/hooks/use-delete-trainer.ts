"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

interface UseDeleteTrainerReturn {
  isLoading: boolean;

  deleteTrainer: (
    id: string
  ) => Promise<boolean>;
}

export const useDeleteTrainer =
  (
    onSuccess?: () => void
  ): UseDeleteTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deleteTrainer =
      async (
        id: string
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.deleteTrainer(
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
              : "Failed to delete trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      deleteTrainer,
    };
  };