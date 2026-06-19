"use client";

import { useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

interface UseDeactivateBatchReturn {
  isLoading: boolean;

  deactivateBatch: (
    id: string,
  ) => Promise<void>;
}

export const useDeactivateBatch =
  (): UseDeactivateBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deactivateBatch = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        await batchService.deactivateBatch(
          id,
        );
      } finally {
        setIsLoading(false);
      }
    };

    return {
      deactivateBatch,
      isLoading,
    };
  };