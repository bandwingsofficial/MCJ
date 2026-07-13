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
    payload: UpdateTrainerRequest,
    image?: File | null
  ) => Promise<boolean>;
}

export const useUpdateTrainer =
  (
    onSuccess?: () => void
  ): UseUpdateTrainerReturn => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const updateTrainer =
      async (
        id: string,
        payload: UpdateTrainerRequest,
        image?: File | null
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const requestPayload: UpdateTrainerRequest =
            {
              ...payload,
            };

          if (image) {
            const uploadResponse =
              await trainerService.uploadTrainerImage(
                image
              );

            requestPayload.profileImageFileId =
              uploadResponse.data.id;
          }

          const response =
            await trainerService.updateTrainer(
              id,
              requestPayload
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