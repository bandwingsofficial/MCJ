"use client";

import {
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  UpdateBatchRequest,
} from "@/src/features/batches/types/batch.types";

interface UseUpdateBatchReturn {
  isLoading: boolean;

  updateBatch: (
    id: string,
    payload: UpdateBatchRequest,
  ) => Promise<void>;
}

export const useUpdateBatch =
  (): UseUpdateBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const updateBatch = async (
      id: string,
      payload: UpdateBatchRequest,
    ) => {
      try {
        setIsLoading(true);

        await batchService.updateBatch(
          id,
          payload,
        );
      } finally {
        setIsLoading(false);
      }
    };

    return {
      updateBatch,
      isLoading,
    };
  };