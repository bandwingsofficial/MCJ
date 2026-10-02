"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { batchService } from "@/src/features/batches/services/batch.service";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";
import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";
import { useBatchLifecycleRefetch } from "@/src/features/batches/hooks/use-batch-lifecycle-refetch";

interface UseBatchReturn {
  batch: Batch | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useBatch = (
  id: string,
): UseBatchReturn => {
  const [batch, setBatch] =
    useState<Batch | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchBatch =
    useCallback(async () => {
      try {
        setIsLoading(true);

        setError(null);

        const response =
          await batchService.getBatch(id);

        setBatch(response.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch batch";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    if (!id) return;

    void fetchBatch();
  }, [fetchBatch, id]);

  useRealtimeRefetch("batch", fetchBatch);
  useBatchLifecycleRefetch(fetchBatch);

  return {
    batch,
    isLoading,
    error,
    refetch: fetchBatch,
  };
};