"use client";

import {
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  CreateBatchRequest,
} from "@/src/features/batches/types/batch.types";

interface UseCreateBatchReturn {
  isLoading: boolean;

  createBatch: (
    payload: CreateBatchRequest,
  ) => Promise<void>;
}

export const useCreateBatch =
  (): UseCreateBatchReturn => {
    const [isLoading, setIsLoading] =
      useState(false);

    const createBatch = async (
      payload: CreateBatchRequest,
    ) => {
      try {
        setIsLoading(true);

        await batchService.createBatch(
          payload,
        );
      } finally {
        setIsLoading(false);
      }
    };

    return {
      createBatch,
      isLoading,
    };
  };