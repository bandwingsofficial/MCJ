"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  BulkTrainerOperationResult,
} from "@/src/features/trainers/types/trainer.types";

interface UseBulkDeactivateTrainersReturn {
  bulkDeactivate: (
    trainerIds: string[]
  ) => Promise<BulkTrainerOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeactivateTrainers(): UseBulkDeactivateTrainersReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDeactivate = async (trainerIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await trainerService.bulkDeactivate(trainerIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to deactivate trainers"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDeactivate, isPending };
}
