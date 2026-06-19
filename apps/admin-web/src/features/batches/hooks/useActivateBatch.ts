"use client";

import { useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

interface UseActivateBatchReturn {
  isLoading: boolean;

  activateBatch: (
    id: string,
  ) => Promise<void>;
}

export const useActivateBatch =
  (): UseActivateBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const activateBatch = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        await batchService.activateBatch(id);
      } finally {
        setIsLoading(false);
      }
    };

    return {
      activateBatch,
      isLoading,
    };
  };