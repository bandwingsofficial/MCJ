"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  BulkTrainerOperationResult,
} from "@/src/features/trainers/types/trainer.types";

interface UseBulkActivateTrainersReturn {
  bulkActivate: (
    trainerIds: string[]
  ) => Promise<BulkTrainerOperationResult | null>;
  isPending: boolean;
}

export function useBulkActivateTrainers(): UseBulkActivateTrainersReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkActivate = async (trainerIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await trainerService.bulkActivate(trainerIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate trainers"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkActivate, isPending };
}
