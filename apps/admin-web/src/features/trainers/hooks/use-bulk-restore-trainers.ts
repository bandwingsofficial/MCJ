"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import type {
  BulkTrainerOperationResult,
} from "@/src/features/trainers/types/trainer.types";

interface UseBulkRestoreTrainersReturn {
  bulkRestore: (
    trainerIds: string[]
  ) => Promise<BulkTrainerOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreTrainers(): UseBulkRestoreTrainersReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestore = async (trainerIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await trainerService.bulkRestore(trainerIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore trainers"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestore, isPending };
}
