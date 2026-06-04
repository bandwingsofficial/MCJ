"use client";

import { useState } from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import { appToast } from "@/src/shared/components/ui/toast";

import type {
  CreateTrainerRequest,
} from "@/src/features/trainers/types/trainer.types";

interface UseCreateTrainerReturn {
  isLoading: boolean;

  createTrainer: (
    payload: CreateTrainerRequest
  ) => Promise<boolean>;
}

export const useCreateTrainer =
  (
    onSuccess?: () => void
  ): UseCreateTrainerReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const createTrainer =
      async (
        payload: CreateTrainerRequest
      ): Promise<boolean> => {
        try {
          setIsLoading(true);

          const response =
            await trainerService.createTrainer(
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
              : "Failed to create trainer"
          );

          return false;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,
      createTrainer,
    };
  };