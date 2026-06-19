"use client";

import { useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

interface UseRestoreBatchReturn {
  isLoading: boolean;

  restoreBatch: (
    id: string,
  ) => Promise<void>;
}

export const useRestoreBatch =
  (): UseRestoreBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const restoreBatch = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        await batchService.restoreBatch(id);
      } finally {
        setIsLoading(false);
      }
    };

    return {
      restoreBatch,
      isLoading,
    };
  };