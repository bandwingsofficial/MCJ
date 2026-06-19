"use client";

import { useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

interface UseDeleteBatchReturn {
  isLoading: boolean;

  deleteBatch: (
    id: string,
  ) => Promise<void>;
}

export const useDeleteBatch =
  (): UseDeleteBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const deleteBatch = async (
      id: string,
    ) => {
      try {
        setIsLoading(true);

        await batchService.deleteBatch(id);
      } finally {
        setIsLoading(false);
      }
    };

    return {
      deleteBatch,
      isLoading,
    };
  };