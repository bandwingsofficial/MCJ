"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  BulkTrainerOperationResult,
} from "@/src/features/trainers/types/trainer.types";

interface UseBulkPermanentDeleteTrainersReturn {
  bulkPermanentDelete: (
    trainerIds: string[]
  ) => Promise<BulkTrainerOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteTrainers(): UseBulkPermanentDeleteTrainersReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDelete = async (
    trainerIds: string[]
  ) => {
    try {
      setIsPending(true);
      const response =
        await trainerService.bulkPermanentDelete(
          trainerIds
        );
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete trainers"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDelete, isPending };
}
