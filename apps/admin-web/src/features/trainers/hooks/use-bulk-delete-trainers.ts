"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  BulkTrainerOperationResult,
} from "@/src/features/trainers/types/trainer.types";

interface UseBulkDeleteTrainersReturn {
  bulkDelete: (
    trainerIds: string[]
  ) => Promise<BulkTrainerOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteTrainers(): UseBulkDeleteTrainersReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDelete = async (trainerIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await trainerService.bulkDelete(trainerIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to archive trainers"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDelete, isPending };
}
